'use strict';

(function(module) {
  function Article(opts) {
    Object.keys(opts).forEach(e => this[e] = opts[e]);
  }

  Article.all = [];

  // REVIEW: We no longer need our prototype method. This functionality has been relocated to the view.
  // Article.prototype.toHtml = function() {
  //   var template = Handlebars.compile($('#article-template').text());
  //
  //   this.daysAgo = parseInt((new Date() - new Date(this.publishedOn))/60/60/24/1000);
  //   this.publishStatus = this.publishedOn ? `published ${this.daysAgo} days ago` : '(draft)';
  //   this.body = marked(this.body);
  //
  //   return template(this);
  // };

  Article.loadAll = rows => {
    rows.sort((a,b) => (new Date(b.publishedOn)) - (new Date(a.publishedOn)));
    Article.all = rows.map(ele => new Article(ele));
  };

  Article.fetchAll = callback => {
    $.get('/articles/all')
    .then(
      results => {
        if (results.length) {
          Article.loadAll(results);
          callback();
        } else {
          $.getJSON('./data/hackerIpsum.json')
          .then(rawData => {
            rawData.forEach(item => {
              let article = new Article(item);
              article.insertRecord();
            })
          })
          .then(() => Article.fetchAll(callback))
          .catch(console.error);
        }
      }
    )
  };

  // REVIEW: We have a new method to query our DB for a specific record, based on varying criteria
  Article.findWhere = function(field, value, callback) {
    $.get('/articles/find', {field: field, val: value})
    .then(callback)
  };

  // REVIEW: A new method for gathering all of the categories
  Article.allCategories = function(callback) {
    $.get('/articles/categories', callback);
  };

  Article.numWordsAll = () => {
    return Article.all.map(article => article.body.match(/\b\w+/g).length)
                      .reduce((a, b) => a + b)
  };

  Article.allAuthors = () => {
    return Article.all.map(article => article.author)
                      .reduce((names, name) => {
                        if (names.indexOf(name) === -1) names.push(name);
                        return names;
                      }, []);
  };

  Article.numWordsByAuthor = () => {
    return Article.allAuthors().map(author => {
      return {
        name: author,
        numWords: Article.all.filter(a => a.author === author)
                             .map(a => a.body.match(/\b\w+/g).length)
                             .reduce((a, b) => a + b)
      }
    })
  };

  Article.stats = () => {
    return {
      numArticles: Article.all.length,
      numWords: Article.numWordsAll(),
      Authors: Article.allAuthors(),
    }
  };

  Article.truncateTable = callback => {
    $.ajax({
      url: '/articles/truncate',
      method: 'DELETE',
    })
    .then(console.log)
    .then(callback);
  };

  Article.prototype.insertRecord = function(callback) {
    $.post('/articles/insert', {author: this.author, authorUrl: this.authorUrl, body: this.body, category: this.category, publishedOn: this.publishedOn, title: this.title})
    .then(console.log)
    .then(callback);
  };

  Article.prototype.deleteRecord = function(callback) {
    $.ajax({
      url: '/articles/delete',
      method: 'DELETE',
      data: {id: this.article_id}
    })
    .then(console.log)
    .then(callback);
  };

  Article.prototype.updateRecord = function(callback) {
    $.ajax({
      url: '/articles/delete',
      method: 'DELETE',
      data: {
        author: this.author,
        authorUrl: this.authorUrl,
        body: this.body,
        category: this.category,
        publishedOn: this.publishedOn,
        title: this.title,
        id: this.article_id}
    })
    .then(console.log)
    .then(callback);
  };

  module.Article = Article;
})(window);
