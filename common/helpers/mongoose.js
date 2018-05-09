function withNextId(currentVal, allValues, currId) {
  const result = currId > 0 ? `${currentVal}-${currId}` : currentVal;
  if (allValues.includes(result)) {
    return withNextId(currentVal, allValues, currId + 1);
  }
  return result;
}

module.exports = {
  withNextId,
};
