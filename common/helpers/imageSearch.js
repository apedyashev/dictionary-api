const got = require('got');

//API: https://contextualwebsearch.com/freeapi
module.exports = {
  async run(query) {
    const imagesResponse = await got(
      `https://contextualwebsearch.com/api/Search/ImageSearchAPI?q=${query}&count=20&autoCorrect=true`
    );
    const data = JSON.parse(imagesResponse.body);
    return data.value;
  }
}
