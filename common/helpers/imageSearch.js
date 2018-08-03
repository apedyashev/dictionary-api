const got = require('got');

module.exports = {
  async run(query) {
    const imagesResponse = await got(
      `https://contextualwebsearch.com/api/Search/ImageSearchAPI?q=${query}&count=20&autoCorrect=true`
    );
    const data = JSON.parse(imagesResponse.body);
    return data.value;
  }
}
