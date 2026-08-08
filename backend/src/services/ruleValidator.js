/**
 * Rule-Tree AST Evaluator for Government Welfare Schemes
 * 
 * SOLE AUTHORITATIVE COMPONENT for setting eligibility status:
 * - ELIGIBLE: All mandatory rules pass, no exclusions triggered.
 * - POTENTIALLY_ELIGIBLE: All currently known mandatory rules pass, but scheme contains optional criteria.
 * - MORE_INFO_REQUIRED: Required rule field is missing (null) from user profile.
 * - INELIGIBLE: Mandatory rule or exclusion explicitly failed.
 */

function getValueByPath(obj, path) {
  if (!obj || !path) return undefined;
  const parts = path.split('.');
  let curr = obj;
  for (const part of parts) {
    if (curr === null || curr === undefined) return undefined;
    curr = curr[part];
  }
  return curr;
}

function evaluateCondition(rule, context) {
  const { field, operator, value } = rule;
  const userVal = getValueByPath(context, field);

  // If user value is undefined or null and rule requires a specific value
  if (userVal === undefined || userVal === null) {
    if (operator === 'EXISTS') return { passed: false, missing: true };
    return { passed: false, missing: true, field };
  }

  const uStr = String(userVal).toLowerCase();
  const vStr = value !== undefined ? String(value).toLowerCase() : '';

  switch (operator) {
    case 'EQ':
    case 'EQUALS':
      return { passed: uStr === vStr, missing: false };

    case 'NEQ':
    case 'NOT_EQUALS':
      return { passed: uStr !== vStr, missing: false };

    case 'GT':
      return { passed: Number(userVal) > Number(value), missing: false };

    case 'GTE':
      return { passed: Number(userVal) >= Number(value), missing: false };

    case 'LT':
      return { passed: Number(userVal) < Number(value), missing: false };

    case 'LTE':
      return { passed: Number(userVal) <= Number(value), missing: false };

    case 'IN':
      if (Array.isArray(value)) {
        const pass = value.some((v) => String(v).toLowerCase() === uStr);
        return { passed: pass, missing: false };
      }
      return { passed: false, missing: false };

    case 'NOT_IN':
      if (Array.isArray(value)) {
        const pass = !value.some((v) => String(v).toLowerCase() === uStr);
        return { passed: pass, missing: false };
      }
      return { passed: true, missing: false };

    case 'CONTAINS':
      return { passed: uStr.includes(vStr), missing: false };

    case 'EXISTS':
      return { passed: userVal !== null && userVal !== undefined, missing: false };

    default:
      return { passed: false, missing: false };
  }
}

export function evaluateRuleNode(node, context) {
  if (!node) return { passed: true, missingFields: [], failedRules: [], matchedRules: [] };

  // Single Condition Node
  if (node.field && node.operator) {
    const res = evaluateCondition(node, context);
    const ruleLabel = `${node.field} ${node.operator} ${node.value !== undefined ? node.value : ''}`;
    if (res.missing) {
      return { passed: false, missingFields: [res.field], failedRules: [], matchedRules: [] };
    }
    if (res.passed) {
      return { passed: true, missingFields: [], failedRules: [], matchedRules: [ruleLabel] };
    }
    return { passed: false, missingFields: [], failedRules: [ruleLabel], matchedRules: [] };
  }

  let allPassed = true;
  const missingFields = [];
  const failedRules = [];
  const matchedRules = [];

  // 1. ALL (AND) Group
  if (Array.isArray(node.all)) {
    for (const child of node.all) {
      const childRes = evaluateRuleNode(child, context);
      if (childRes.missingFields.length > 0) {
        missingFields.push(...childRes.missingFields);
        allPassed = false;
      }
      if (childRes.failedRules.length > 0) {
        failedRules.push(...childRes.failedRules);
        allPassed = false;
      }
      matchedRules.push(...childRes.matchedRules);
    }
  }

  // 2. ANY (OR) Group
  if (Array.isArray(node.any)) {
    let anyPassed = false;
    const anyMissing = [];
    const anyFailed = [];
    const anyMatched = [];

    for (const child of node.any) {
      const childRes = evaluateRuleNode(child, context);
      if (childRes.passed) {
        anyPassed = true;
        anyMatched.push(...childRes.matchedRules);
      } else {
        anyMissing.push(...childRes.missingFields);
        anyFailed.push(...childRes.failedRules);
      }
    }

    if (!anyPassed) {
      allPassed = false;
      if (anyMissing.length > 0) missingFields.push(...anyMissing);
      else failedRules.push(...anyFailed);
    } else {
      matchedRules.push(...anyMatched);
    }
  }

  // 3. NOT Group
  if (node.not) {
    const notRes = evaluateRuleNode(node.not, context);
    if (notRes.passed) {
      allPassed = false;
      failedRules.push(`Exclusion rule triggered: ${notRes.matchedRules.join(', ')}`);
    } else if (notRes.missingFields.length > 0) {
      missingFields.push(...notRes.missingFields);
      allPassed = false;
    }
  }

  return {
    passed: allPassed && missingFields.length === 0,
    missingFields: Array.from(new Set(missingFields)),
    failedRules: Array.from(new Set(failedRules)),
    matchedRules: Array.from(new Set(matchedRules)),
  };
}

export function evaluateSchemeEligibility(schemeRules, context) {
  // If scheme has no AST rules, return POTENTIALLY_ELIGIBLE
  if (!schemeRules || (typeof schemeRules === 'object' && Object.keys(schemeRules).length === 0)) {
    return {
      status: 'POTENTIALLY_ELIGIBLE',
      matchedRules: ['Demographic baseline alignment'],
      missingFields: [],
      failedRules: [],
    };
  }

  const res = evaluateRuleNode(schemeRules, context);

  if (res.failedRules.length > 0) {
    return {
      status: 'INELIGIBLE',
      matchedRules: res.matchedRules,
      missingFields: res.missingFields,
      failedRules: res.failedRules,
    };
  }

  if (res.missingFields.length > 0) {
    return {
      status: 'MORE_INFO_REQUIRED',
      matchedRules: res.matchedRules,
      missingFields: res.missingFields,
      failedRules: [],
    };
  }

  if (res.passed) {
    return {
      status: 'ELIGIBLE',
      matchedRules: res.matchedRules,
      missingFields: [],
      failedRules: [],
    };
  }

  return {
    status: 'POTENTIALLY_ELIGIBLE',
    matchedRules: res.matchedRules,
    missingFields: [],
    failedRules: [],
  };
}
