module.exports = {
  normalizeErrors: (errors) => {
    let normalizeErrors = [];
    for (let key in errors) {
      if(errors.hasOwnProperty(key)) {
        normalizeErrors.push({title: key, detail: errors[key].message})
      }
    }

    return normalizeErrors;
  }
}
