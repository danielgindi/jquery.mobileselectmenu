/** @preserve    Library by Daniel Cohen Gindi (danielgindi@gmail.com) 054-5655765 
    MIT License!
    Version: 2014-02-18
*/
(function($){

    var defaults = {
        /** @expose */ culture: 'auto',
        /** @expose */ className: 'select-menu',
        /** @expose */ subMenuSelector: '.sub-menu,.top-sub-menu,.side-sub-menu,.menu-sub,.top-menu-sub,.side-menu-sub'
    }, cultures = {
        /** @expose */ 
        'en': {
            /** @expose */ defaultText: 'Navigate to...',
            /** @expose */ subMenuPre: '&nbsp;',
            /** @expose */ subMenuDash: '&ndash;',
            /** @expose */ subMenuSuf: ''
        },
        'he': {
            /** @expose */ defaultText: 'נווט אל...',
            /** @expose */ subMenuPre: '&nbsp;',
            /** @expose */ subMenuDash: '&ndash;',
            /** @expose */ subMenuSuf: ''
        }
    };

    function findCulture (cultures, defaultLang) {
        var lang = document.documentElement.getAttribute('lang') || document.documentElement.getAttribute('xml:lang');
        if (!lang) {
            var metas = document.getElementsByTagName('meta');
            for (var i = 0, meta; i < metas.length; i++) {
                meta = metas[i];
                if ((meta.getAttribute('http-equiv') || '').toLowerCase() == 'content-language') {
                    lang = meta.getAttribute('content');
                    break;
                }
            }
        }
        if (lang == 'iw') lang = 'he'; // Fallback from Google's old spec, if the setting came from an old Android device
        if (!lang && defaultLang && defaultLang !== 'auto') {
            lang = defaultLang;
        }
        if (!lang) {
            for (var key in cultures) {
                if (!cultures.hasOwnProperty(key)) continue;
                lang = key;
                break;
            }
        }
        while (typeof lang === 'string') {
            if (cultures[lang]) return cultures[lang];
            var idx = lang.lastIndexOf('-');
            if (idx < 0) {
                idx = lang.lastIndexOf('_');
            }
            if (idx > 0) {
                lang = lang.substr(0, idx);
            } else {
                for (var key in cultures) {
                    if (!cultures.hasOwnProperty(key)) continue;
                    return cultures[key];
                }
                break;
            }
        }
        return lang;
    }

    function htmlEncode(text) {
        return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/'/g, "&#39;").replace(/"/g, "&quot;");
    };
        
    /** @expose */
    $.fn.mobileSelectMenu = function(options) {

        options = $.extend(defaults, options);
        
        // Prepare the culture that we are working with
        var culture = findCulture($.fn.mobileSelectMenu.Cultures, options.culture);
            
        var location = window.location,
            isRoot = location.pathname === '/',
            fullHref = location.href,
            relativeHref = location.href.substr(location.origin.length),
            fullHrefNoHash = fullHref.indexOf('#') > -1 ? fullHref.substr(0, fullHref.indexOf('#')) : fullHref,
            relativeHrefNoHash = location.pathname;

        this.each(function(){
            var $el = $(this).addClass(options.subMenuClass);
            
            var $select = $('<select />', { 'class': options.className }).insertAfter($el);
            $('<option />', { "value": '#', "text": culture.defaultText }).appendTo($select);

            $el.find('a,.separator').each(function(){
            
                var $this = $(this),
                    text = htmlEncode($this.text()),
                    subLevel = $this.parents(options.subMenuSelector).length;

                if (subLevel > 0) {
                    var dash = (culture.subMenuPre != null ? culture.subMenuPre : '') +
                                Array( subLevel + 1 ).join( culture.subMenuDash ) +
                                (culture.subMenuSuf != null ? culture.subMenuSuf : '');
                    text = dash + text;
                }
                if (!$this.is('a')){
                    $('<optgroup />', { 'label': text }).appendTo($select);
                } else {
                    $('<option />', { 
                        'value': this.href, 
                        'html': text, 
                        'selected': ((!isRoot && ( // Prevent home-page from being selected by default
                                        this.href == fullHref || // Match the current full href with the #
                                        this.href == relativeHref || // Match the current relative href with the #
                                        this.href == fullHrefNoHash || // Match the current full href without the #
                                        this.href == relativeHrefNoHash // Match the current relative href without the #
                                    )) ||
                                    $this.is('.selected,.sel,.active') || // Has a selected class
                                    $this.closest('li').is('.selected,.sel,.active')) // Or its parent li has a selected class
                        }).appendTo($select);
                }

            }); 

            $select.change(function(){
                var href = $(this).val();
                if (/^\s+javascript\s+:/.test(href)) {
                    // Execute the A's javascript
                    eval(href); 
                } else {
                    // Go to the url
                    window.location.href = href;
                }
            });

        });
        return this;
    };

    /** @expose */ $.fn.mobileSelectMenu.Cultures = cultures;
    /** @expose */ $.fn.mobileSelectMenu.Defaults = defaults;
    
})(jQuery);