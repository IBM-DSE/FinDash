
const Util = {

  stringToCurrency: function(str) {
    let num = parseInt(str, 10).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
    return '$ '+num;
  }

};

export default Util;