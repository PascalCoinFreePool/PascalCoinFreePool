/**
 * Common javascript code for Free Pascal Pool
 * GitHub: https://github.com/
 **/

/**
 * Cookies handler
 **/

var docCookies = {
    getItem: function (sKey) {
        return decodeURIComponent(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1")) || null;
    },
    setItem: function (sKey, sValue, vEnd, sPath, sDomain, bSecure) {
        if(!sKey || /^(?:expires|max\-age|path|domain|secure)$/i.test(sKey)) { return false; }
        var sExpires = "";
        if(vEnd) {
            switch (vEnd.constructor) {
            case Number:
                sExpires = vEnd === Infinity ? "; expires=Fri, 31 Dec 9999 23:59:59 GMT" : "; max-age=" + vEnd;
                break;
            case String:
                sExpires = "; expires=" + vEnd;
                break;
            case Date:
                sExpires = "; expires=" + vEnd.toUTCString();
                break;
            }
        }
        document.cookie = encodeURIComponent(sKey) + "=" + encodeURIComponent(sValue) + sExpires + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "") + (bSecure ? "; secure" : "");
        return true;
    },
    removeItem: function (sKey, sPath, sDomain) {
        if(!sKey || !this.hasItem(sKey)) { return false; }
        document.cookie = encodeURIComponent(sKey) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT" + ( sDomain ? "; domain=" + sDomain : "") + ( sPath ? "; path=" + sPath : "");
        return true;
    },
    hasItem: function (sKey) {
        return (new RegExp("(?:^|;\\s*)" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=")).test(document.cookie);
    }
};

/**
 * Pages routing
 **/

// Current page
var currentPage;

// Handle hash change
window.onhashchange = function() {
    routePage();
};

// Route to page
var xhrPageLoading;
function routePage(loadedCallback) {
    if(currentPage) currentPage.destroy();
    $('#page').html('');
    $('#loading').show();

    if(xhrPageLoading) {
        xhrPageLoading.abort();
    }

    var hash = window.location.hash.split('/')[0];
    $('.hot_link').parent().removeClass('active');
    var $link = $('a.hot_link[href="' + (hash || '#') + '"]');

    $link.parent().addClass('active');
    var page = $link.data('page');

    loadTranslations();

    xhrPageLoading = $.ajax({
        url: 'pages/' + page,
        cache: false,
        success: function (data) {
            $('#menu-content').collapse('hide');
            $('#loading').hide();
            $('#page').show().html(data);
	    loadTranslations();
            if(currentPage) currentPage.update();
            if(loadedCallback) loadedCallback();
        }
    });
}

/**
 * Strings
 **/

// Add .update() custom jQuery function to update text content
$.fn.update = function(txt) {
    var el = this[0];
    if(el.textContent !== txt)
        el.textContent = txt;
    return this;
};

// Update Text classes
function updateTextClasses(className, text) {
    var els = document.getElementsByClassName(className);
    if(els) {
        for (var i = 0; i < els.length; i++) {
            var el = els[i];
            if(el && el.textContent !== text)
                el.textContent = text;
        }
    }
}

// Update Text content
function updateText(elementId, text) {
    var el = document.getElementById(elementId);
    if(el && el.textContent !== text) {
        el.textContent = text;
    }
    return el;
}

// Convert float to string
function floatToString(float) {
    return float.toFixed(6).replace(/\.0+$|0+$/, '');
}

// Format number
function formatNumber(number, delimiter) {
    if(number != '') {
        number = number.split(delimiter).join('');

        var formatted = '';
        var sign = '';

        if(number < 0) {
            number = -number;
            sign = '-';
        }

        while(number >= 1000) {
            var mod = number % 1000;

            if(formatted != '') formatted = delimiter + formatted;
            if(mod == 0) formatted = '000' + formatted;
            else if(mod < 10) formatted = '00' + mod + formatted;
            else if(mod < 100) formatted = '0' + mod + formatted;
            else formatted = mod + formatted;

            number = parseInt(number / 1000);
        }

        if(formatted != '') formatted = sign + number + delimiter + formatted;
        else formatted = sign + number;
        return formatted;
    }
    return '';
}

// Format date
function formatDate(time) {
    if(!time) return '';
    return new Date(parseInt(time) * 1000).toLocaleString();
}

// Format percentage
function formatPercent(percent) {
    if(!percent && percent !== 0) return '';
    return percent + '%';
}

// Get readable time
function getReadableTime(seconds) {
    var units = [ [60, 'second'], [60, 'minute'], [24, 'hour'],
                  [7, 'day'], [4, 'week'], [12, 'month'], [1, 'year'] ];

    function formatAmounts(amount, unit) {
        var rounded = Math.round(amount);
	var unit = unit + (rounded > 1 ? 's' : '');
        if(getTranslation(unit)) unit = getTranslation(unit);
        return '' + rounded + ' ' + unit;
    }

    var amount = seconds;
    for (var i = 0; i < units.length; i++) {
        if(amount < units[i][0]) {
            return formatAmounts(amount, units[i][1]);
        }
        amount = amount / units[i][0];
    }
    return formatAmounts(amount,  units[units.length - 1][1]);
}

// Get readable hashrate
function getReadableHashRateString(hashrate) {
    if(!hashrate) hashrate = 0;

    var i = 0;
    var byteUnits = [' H', ' kH', ' MH', ' GH', ' TH', ' PH' ];
    if(hashrate > 0) {
        while (hashrate > 1000) {
            hashrate = hashrate / 1000;
            i++;
        }
    }
    return parseFloat(hashrate).toFixed(2) + byteUnits[i];
}

// Get readable coins
function getReadableCoins(coins, atomicUnits=false, withoutSymbol=false) {
    if(atomicUnits)
        var amount = (parseInt(coins || 0) / 10000).toFixed(4);
    else
        var amount = parseFloat(coins || 0).toFixed(4);
    return amount.toString() + (withoutSymbol ? '' : (' ' + lastStats.config.symbol));
}

// Format account link
function formatAccountLink(account) {
    if(typeof account === 'object' && account !== null) {
        if(account.known_account) {
            var title = account.known_account + " " + account.payment_id;
        } else {
            var title = account.address_pid;
        }
        return '<a href="#account/'+account.address_pid+'">'+title+'</a>';
    } else {
        return '<a href="#account/'+account+'">'+account+'</a>';
    }
}

// Format external account linke
function formatExternalAccountLink(account, name=false) {
    var title = name ? name : account;
    return '<a target="_blank" href="' + getAccountUrl(account) + '">' + title + '</a>';
}

// Format payment link
function formatPaymentLink(hash) {
    return '<a target="_blank" href="' + getTransactionUrl(hash) + '">' + hash + '</a>';
}

// Format difficulty
function formatDifficulty(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

// Format luck / current effort
function formatLuck(difficulty, shares) {
    var percent = Math.round(shares / difficulty * 100);
    if(!percent) {
        return '<span class="luckGood">?</span>';
    }
    else if(percent <= 100) {
        return '<span class="luckGood">' + percent + '%</span>';
    }
    else if(percent >= 101 && percent <= 150) {
        return '<span class="luckMid">' + percent + '%</span>';
    }
    else{
        return '<span class="luckBad">' + percent + '%</span>';
    }
}

/**
 * URLs
 **/

// Return pool host
function getPoolHost() {
    if(typeof poolHost != "undefined") return poolHost;
    if(lastStats.config.poolHost) return lastStats.config.poolHost;
    else return window.location.hostname;
}

// Return transaction URL
function getTransactionUrl(id) {
    return transactionExplorer.replace(new RegExp('{id}', 'g'), id);
}

// Return accoutn URL
function getAccountUrl(id) {
    return accountExplorer.replace(new RegExp('{id}', 'g'), id);
}

// Return blockchain explorer URL
function getBlockchainUrl(id) {
    return blockchainExplorer.replace(new RegExp('{id}', 'g'), id);
}

/**
 * Tables
 **/

// Sort table cells
function sortTable() {
    var table = $(this).parents('table').eq(0),
        rows = table.find('tr:gt(0)').toArray().sort(compareTableRows($(this).index()));
    this.asc = !this.asc;
    if(!this.asc) {
        rows = rows.reverse()
    }
    for(var i = 0; i < rows.length; i++) {
        table.append(rows[i])
    }
}

// Compare table rows
function compareTableRows(index) {
    return function(a, b) {
        var valA = getCellValue(a, index), valB = getCellValue(b, index);
        if(!valA) { valA = 0; }
        if(!valB) { valB = 0; }
        return $.isNumeric(valA) && $.isNumeric(valB) ? valA - valB : valA.toString().localeCompare(valB.toString())
    }
}

// Get table cell value
function getCellValue(row, index) {
    return $(row).children('td').eq(index).data("sort")
}

/**
 * Translations
 **/

if(typeof langs == "undefined") {
    var langs = { en: 'English' };
}

if(typeof defaultLang == "undefined") {
    var defaultLang = 'en';
}

var langCode = defaultLang;
var langData = null;

function getTranslation(key) {
    if(!langData || !langData[key]) return null;
    return langData[key];
}

var translate = function(data) {
    langData = data;

    $("[tkey]").each(function(index) {
        var strTr = data[$(this).attr('tkey')];
        $(this).html(strTr);
    });

    $("[tplaceholder]").each(function(index) {
        var strTr = data[$(this).attr('tplaceholder')];
	$(this).attr('placeholder', strTr)
    });

    $("[tvalue]").each(function(index) {
        var strTr = data[$(this).attr('tvalue')];
        $(this).attr('value', strTr)
    });
}

// Get language code from URL
const $_GET = {};
const args = location.search.substr(1).split(/&/);
for (var i=0; i<args.length; ++i) {
    const tmp = args[i].split(/=/);
    if(tmp[0] != "") {
        $_GET[decodeURIComponent(tmp[0])] = decodeURIComponent(tmp.slice(1).join("").replace("+", " "));
        var langCode = $_GET['lang'];
    }
}

// Load language
function loadTranslations() {
    if(langData) {
        translate(langData);
    }
    else if(langs && langs[langCode]) {
        $.getJSON('lang/'+langCode+'.json', translate);
        $.getScript('lang/timeago/jquery.timeago.'+langCode+'.js');
    } else {
        $.getJSON('lang/'+defaultLang+'.json', translate);
        $.getScript('lang/timeago/jquery.timeago.'+defaultLang+'.js');
    }
}

// Language selector
function renderLangSelector() {

    var html = '';
    var numLangs = 0;
    if(langs) {
        html += '<select id="newLang" class="form-control form-control-sm">';
        for (var lang in langs) {
            var selected = lang == langCode ? ' selected="selected"' : '';
            html += '<option value="' + lang + '"' + selected + '>' + langs[lang] + '</option>';
	    numLangs ++;
        }
	html += '</select>';
    }
    if(html && numLangs > 1) {
        $('#langSelector').html(html);
        $('#newLang').each(function() {
            $(this).change(function() {
                var newLang = $(this).val();
                var url = '?lang=' + newLang;
                if(window.location.hash) url += window.location.hash;
                window.location.href = url;
            });
        });
    }
}

// Navbar
$(".navbar-nav a:not(.dropdown-toggle), #accountSearch button").on("click", function(){
    $(".navbar-collapse").collapse("hide");
});

toastr.options = {
    "closeButton": false,
    "debug": false,
    "newestOnTop": false,
    "progressBar": false,
    "positionClass": "toast-top-right",
    "preventDuplicates": false,
    "onclick": null,
    "showDuration": "300",
    "hideDuration": "1000",
    "timeOut": "5000",
    "extendedTimeOut": "1000",
    "showEasing": "swing",
    "hideEasing": "linear",
    "showMethod": "fadeIn",
    "hideMethod": "fadeOut"
}
function showToast(message="", title="") {
    toastr.success(message, title);
}

var _totalBlocks = false;
function checkForNewBlocks() {
    if(!_totalBlocks) {
        _totalBlocks = lastStats.pool.totalBlocks;
        return;
    }

    var _lastBlock = false;

    if(lastStats.pool.totalBlocks != _totalBlocks) {
        _totalBlocks = lastStats.pool.totalBlocks;
        var _lastBlockTimestamp = ":"+lastStats.pool.lastBlockFound.toString().slice(0, -3)+":";
        for(var i = 0; i < lastStats.pool.blocks.length; i += 2) {
            if(lastStats.pool.blocks[i].indexOf(_lastBlockTimestamp) !== -1) {
                var parts = lastStats.pool.blocks[i].split(':');
                _lastBlock = {
                    height: parseInt(lastStats.pool.blocks[i+1]),
                    worker: parts[0],
                    hash: parts[1],
                    time: parts[2],
                    difficulty: parseInt(parts[3]),
                    shares: parseInt(parts[4]),
                    reward: (parts[5] / 10000).toFixed(4),
                    orphaned: parts[6]
                };
                break;
            }
        }
    }

    if(_lastBlock !== false) {
        var _effort = (100*_lastBlock.shares/_lastBlock.difficulty).toFixed(1)
        var _height = parseInt(_lastBlock.height).toLocaleString();
        showToast("Block at height "+_height+" found by " + _lastBlock.worker + " with "+_effort+"% effort", "Block Found!");
    }
}
