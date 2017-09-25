'use strict';
require('assert');
require('should');
require('mocha-steps');

const url = 'http://localhost:3000/';

describe('Susan prepares for her meeting with Leo Rakes', () => {

  step('visits the Financial Advisor Dashboard home page', () => {

    browser.setViewportSize({
      width: 1200,
      height: 800
    });

    // Navigates to the URL
    browser.url(url);

    // Page title and Welcome text
    browser.getTitle().should.equal('React App');
    browser.getText('a=Financial Advisor Dashboard');
    browser.getText('h1=Welcome, Susan!');

    checkBig3Indices();

    // Clients list
    browser.getText('h1=Clients');
    browser.waitForText('p*=Account Balance: ').should.be.true();
    let accBals = browser.getText('p*=Account Balance: ');
    accBals.should.have.a.length(8);
    accBals.should.matchEach((str) => {
      let accBal = parseFloat(str.slice(str.indexOf('$')+1).replace(/,/g, ''));
      accBal.should.be.greaterThan(100000);
    });

    // Calendar
    browser.getText('h1=Calendar');
    let calendar = browser.element('div.rbc-calendar');
    calendar.getText('span.rbc-toolbar-label').should.equal('Wednesday Jul 19');
    calendar.getText('strong=Annual Review with Leo Rakes');
    calendar.getText('p*=Zoom URL: https://zoom.us/j/');

    // Recent Market News
    browser.getText('h2=Recent Market News');
    browser.waitForExist('div.panel.panel-default');
    browser.getText('h3.panel-title').should.containEql('The US dollar will rebound in the second half of 2017, says JPMorgan')

  });

  step('visits the Leo Rakes client page', () => {

    // Click Leo Rakes Button
    let leoLink = browser.element('a[href="/clients/1000016"]');
    leoLink.getText().should.containEql('Leo Rakes');
    leoLink.click();

    // Arrive at Leo Rakes Client Profile
    browser.getText('h2=Client Profile');
    browser.waitForExist('div.xx-large=Leo Rakes');

    // See Client Details
    $('tr*=Gender').getText().should.equal('Gender M');
    $('tr*=Age').getText().should.equal('Age 45-54');
    $('tr*=Annual Income').getText().should.equal('Annual Income $ 392,655.00');
    $('tr*=Education').getText().should.equal('Education Masters');
    $('tr*=Profession').getText().should.equal('Profession Executive');

    $('tr*=Account Type').getText().should.equal('Account Balance Trades per Year Account Type Trading Strategy Trading Style');
    $('tr*=Option').getText().should.equal('$ 654,758.00 6 Option Growth Swing');

    browser.getText('h3=Last Meeting with Leo Rakes: October 24th, 2016');

    // See Industry Affinity
    browser.getText('h3=Predicted Industry Affinity');
    $('thead*=Auto').getText().should.equal('Auto Tech Airlines Hotels');
    $('tbody*=94%').getText().should.equal('94%\n84%\n48%\n31%');
    $('tbody*=94%').$$('span.glyphicon').map(span => span.getAttribute('class')).should.deepEqual(
      ['glyphicon glyphicon-arrow-up',
      'glyphicon glyphicon-arrow-down',
      'glyphicon glyphicon-arrow-down',
      'glyphicon glyphicon-arrow-down']);

    // See Portfolio
    browser.getText('h3=Portfolio');
    let stockPanel = $('div#stock-panel');
    stockPanel.$('div*=Auto').getText().should.equal('Auto\nSelect All\nFerrari NV (RACE)\n' +
      'Tech\nSelect All\nAmazon (AMZN)\nAlphabet (GOOGL)\nApple (AAPL)');

    checkDefaultChartState();
  });

  step('moves to the market view', () => {

    // Click the Button that says 'Compare Against the Market'
    let marketBtn = $('a*=Compare Against the Market');
    marketBtn.click();

    // See Big 3 indices with movement indicators
    checkBig3Indices();

    // View Stock chart with Leo Rakes' stocks selected
    checkDefaultChartState();

    // Toggle off all Tech stocks
    let categoryTech = $('div.category*=Tech');
    categoryTech.click('div=Select All');

    shouldBeDeselected('#plot-AMZN');
    shouldBeDeselected('#plot-GOOGL');
    shouldBeDeselected('#plot-AAPL');

    // Toggle on all Auto stocks
    let categoryAuto = $('div.category*=Auto');
    categoryAuto.click('div=Select All');

    shouldBeSelected('#plot-F');
    shouldBeSelected('#plot-TSLA');
    shouldBeSelected('#plot-FCAU');
    shouldBeSelected('#plot-TM');
    shouldBeSelected('#plot-HMC');
    shouldBeSelected('#plot-RACE');
    shouldBeSelected('#plot-CARZ');
  });

});

// Check Big 3 indices with movement indicators
function checkBig3Indices() {
  browser.getText('strong=S&P 500');
  browser.getText('strong=DJIA');
  browser.getText('strong=NASDAQ');
  browser.getHTML('span.glyphicon.glyphicon-arrow-down').should.have.length(2);
  browser.getHTML('span.glyphicon.glyphicon-arrow-up').should.be.a.String();
}

// Check Stock chart with Leo Rakes' stocks selected
function checkDefaultChartState() {
  browser.getText('h2=Stock Analysis');
  $('div.checkbox=Relative Performance').$('input').isSelected().should.be.true();

  shouldBeSelected('#plot-RACE');
  shouldBeSelected('#plot-AMZN');
  shouldBeSelected('#plot-GOOGL');
  shouldBeSelected('#plot-AAPL');

  $('button#corr-sel').getText().should.equal('Plot Correlation');
  $('button.selected-date-range-btn').getText().should.equal('2016-09-01 - 2017-07-05');
}

const loadWait = 3;
function shouldBeSelected(id) {
  $(id+' > input').isSelected().should.be.true();
  let label = $(id);
  label.getAttribute('class').should.containEql('active');
  browser.waitUntil(() => label.getAttribute('style').includes('background-color: rgb('),
    loadWait*1000, 'expected color to be added after '+loadWait+'s');
  label.getAttribute('style').should.containEql('background-color: rgb(')
}

function shouldBeDeselected(id) {
  $(id+' > input').isSelected().should.be.false();
  $(id).getAttribute('class').should.not.containEql('active');
}