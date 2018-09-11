'use strict';

function Article (rawDataObj) {
  this.author = rawDataObj.author;
  this.authorUrl = rawDataObj.authorUrl;
  this.title = rawDataObj.title;
  this.category = rawDataObj.category;
  this.body = rawDataObj.body;
  this.publishedOn = rawDataObj.publishedOn;
}

// REVIEW: Instead of a global `articles = []` array, let's attach this list of all articles directly to the constructor function. Note: it is NOT on the prototype. In JavaScript, functions are themselves objects, which means we can add properties/values to them at any time. In this case, the array relates to ALL of the Article objects, so it does not belong on the prototype, as that would only be relevant to a single instantiated Article.
Article.all = [];

// COMMENT: Why isn't this method written as an arrow function?
// PUT YOUR RESPONSE HERE
// contextual this is needed to preserve the refernce to the article instance the method is being called on
Article.prototype.toHtml = function() {
  let template = Handlebars.compile($('#article-template').text());

  this.daysAgo = parseInt((new Date() - new Date(this.publishedOn))/60/60/24/1000);

  // COMMENT: What is going on in the line below? What do the question mark and colon represent? How have we seen this same logic represented previously?
  // Not sure? Check the docs!
  // PUT YOUR RESPONSE HERE
  // this is a ternary operator, the question mark is an operatior that dictates that if the preceding value is truthy the varibel will take the value of the left side argument and visa versa
  this.publishStatus = this.publishedOn ? `published ${this.daysAgo} days ago` : '(draft)';
  this.body = marked(this.body);

  return template(this);
};

// REVIEW: There are some other functions that also relate to all articles across the board, rather than just single instances. Object-oriented programming would call these "class-level" functions, that are relevant to the entire "class" of objects that are Articles.

// REVIEW: This function will take the rawData, how ever it is provided, and use it to instantiate all the articles. This code is moved from elsewhere, and encapsulated in a simply-named function for clarity.

// COMMENT: Where is this function called? What does 'rawData' represent now? How is this different from previous labs?
// PUT YOUR RESPONSE HERE
//  this function is called inside of the fetch all.
// It is the function that take the article data either from local storage or from an ajax request, and creates Article instnaces with that data.
// These Article instances are pushing into the Article.all array
Article.loadAll = articleData => {
  console.log(articleData);
  articleData.sort((a,b) => (new Date(b.publishedOn)) - (new Date(a.publishedOn)))

  articleData.forEach(articleObject => Article.all.push(new Article(articleObject)))
}

// REVIEW: This function will retrieve the data from either a local or remote source, and process it, then hand off control to the View.
Article.fetchAll = () => {
  // REVIEW: What is this 'if' statement checking for? Where was the rawData set to local storage?
  let match;
  $.ajax({
    type: 'HEAD',
    url: '../data/hackerIpsum.json',
    complete: function(xhr) {
      var ETag = xhr.getResponseHeader('ETag');
      if(ETag !== localStorage.ETag){
        localStorage.setItem('ETag', ETag)
        return match = false;
      }
      return match = true;
    }
  }).then(() => {
    if (match) {
      let parsedData = JSON.parse(localStorage.rawData)
      Article.loadAll(parsedData);
      articleView.initIndexPage()
    } else {
      $.getJSON('../data/hackerIpsum.json', function(data) {
        localStorage.setItem('rawData', JSON.stringify(data))
        console.log(data);
        Article.loadAll(data);
        articleView.initIndexPage()
      })
    }

  })

}
