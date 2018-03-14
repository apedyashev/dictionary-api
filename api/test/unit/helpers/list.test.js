const {assert} = require('chai');
const {parseSortBy} = require(`${TEST_BASE}/../src/helpers/list`);

describe('List helper', () => {
  describe('parseSortBy', () => {
    it('should return default sort query if input param is missed', () => {
      const sort = parseSortBy();
      assert.deepEqual(sort, {createdAt: 'desc'});
    });

    it('should return default sort query if input param is empty string', () => {
      const sort = parseSortBy('');
      assert.deepEqual(sort, {createdAt: 'desc'});
    });

    it('should assign default sort direction if it` missed', () => {
      const sort = parseSortBy('id');
      assert.deepEqual(sort, {id: 'asc'});
    });

    it('should parse multiple fields', () => {
      const sort = parseSortBy('id:asc,title:desc');
      assert.deepEqual(sort, {id: 'asc', title: 'desc'});
    });

    it('should assign default sort direction if it` missed in case of multiple fields', () => {
      const sort = parseSortBy('id:asc,title');
      assert.deepEqual(sort, {id: 'asc', title: 'asc'});
    });

    it('should throw an error if sort direction is invalid', () => {
      assert.throws(
        () => parseSortBy('id:asc1'),
        Error,
        'invalid sort direction - can be asc or desc'
      );
    });

    it('should ignore segments where field name is missed', () => {
      const sort = parseSortBy(':asc,title:desc');
      assert.deepEqual(sort, {title: 'desc'});
    });
  });
});
