'use strict';
const assert = require('assert');
const should = require('should');

const url = 'https://findash.mybluemix.net/';

describe('Susan prepares for her meeting with Leo Rakes', () => {

  it('visits the Financial Advisor Dashboard home page', () => {
    browser.url(url);

    // Page title and Welcome text
    browser.getTitle().should.be.exactly('React App');
    browser.getText('h1=Welcome, Susan!');

    // Big 3 indices with movement indicators
    browser.getText('strong=S&P 500');
    browser.getText('strong=DJIA');
    browser.getText('strong=NASDAQ');
    browser.getHTML('span.glyphicon.glyphicon-arrow-down').should.have.length(2);
    browser.getHTML('span.glyphicon.glyphicon-arrow-up').should.be.a.String();

    // Clients list
    browser.getText('h1=Clients');
    let accBals = browser.getText('p*=Account Balance: ');
    accBals.should.have.a.length(8);
    accBals.should.matchEach((str) => {
      let accBal = parseFloat(str.slice(str.indexOf('$')+1).replace(/,/g, ''));
      accBal.should.be.greaterThan(100000);
    });

    // Calendar
    browser.getText('h1=Calendar');
    let calendar = browser.element('div.rbc-calendar');
    calendar.getText('span.rbc-toolbar-label').should.be.exactly('Wednesday Jul 19');
    calendar.getText('strong=Annual Review with Leo Rakes');
    calendar.getText('p*=Zoom URL: https://zoom.us/j/');

    // Recent Market News
    browser.getText('h2=Recent Market News');
    browser.getText('h3=Fetching News...');
    browser.waitForExist('div.panel.panel-default');
    browser.getText('h3.panel-title').should.containEql('The US dollar will rebound in the second half of 2017, says JPMorgan')

    let leoLink = browser.element('a[href="/clients/1000016"]');
    leoLink.getText('strong=Leo Rakes');
  })

});