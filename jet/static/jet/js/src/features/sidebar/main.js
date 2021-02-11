var $ = require('jquery');
var SideBarApplicationPinning = require('./application-pinning');
var SideBarBookmarks = require('./bookmarks');
var PerfectScroll = require('perfect-scrollbar');
require('browsernizr/test/touchevents');
require('browsernizr');
require('jquery.cookie');

var SideBar = function($sidebar) {
    this.$sidebar = $sidebar;
};

SideBar.prototype = {
    initScrollBars: function($sidebar) {
        if (!$(document.documentElement).hasClass('touchevents')) {
           new PerfectScroll('.sidebar-wrapper');
        }
    },
    initSideBarToggle: function() {
        var toggle = function(e) {
            e.preventDefault();
            this.sideBarToggle();
        };

        $('.sidebar-toggle').on('click', toggle.bind(this));
        $(document.body).on('click', '.sidebar-backdrop', toggle.bind(this));
    },
    sideBarToggle: function() {
        var $dependent = $('.sidebar-dependent');
        var open = !$dependent.hasClass('sidebar-opened') && !$(document.body).hasClass('menu-pinned');

        $(document.body).toggleClass('non-scrollable', open).removeClass('menu-pinned');
        $dependent.toggleClass('sidebar-opened', open);

        this.storePinStatus(false);
        this.toggleBackdrop(open);
    },
    toggleBackdrop: function(open) {
        if (open) {
            var backdrop = $('<div/>', {class: 'sidebar-backdrop'});
            $(document.body).append(backdrop);
            backdrop.animate({opacity: 0.5}, 300);
        } else {
            $('.sidebar-backdrop').animate({opacity: 0}, 300, function () {
                $(this).remove();
            });
        }
    },
    initPinSideBar: function($sidebar) {
        $sidebar.on('click', '.sidebar-pin', (function () {
            var $dependent = $('.sidebar-dependent');

            if ($(document.body).hasClass('menu-pinned')) {
                $dependent.removeClass('sidebar-opened');
                $(document.body).removeClass('menu-pinned');
                this.storePinStatus(false);
            } else {
                this.storePinStatus(true);
                $(document.body).addClass('menu-pinned').removeClass('non-scrollable');
            }

            this.toggleBackdrop(false);

            setTimeout(function() {
                $(window).trigger('resize');
            }, 500);
        }).bind(this));
    },
    menuToggle: function(){
         $('.apps-list-menu-item').on('click', (function () {
             var $submenu = $(this).next('.apps-list-submenu');
             if ($submenu.hasClass('open')){
                 $submenu.slideUp();
                 $submenu.removeClass('open');
                 $(this).removeClass('open');
             }else{
                 $submenu.slideDown();
                 $(this).addClass('open');
                 $submenu.addClass('open');
             }
         }));
         var $submenu = $('.apps-list-submenu:has(div.current)');
         $submenu.addClass('open');
         var $submenuPrev = $submenu.prev();
         $submenuPrev.addClass('open');
         $submenuPrev.css("background-color", "#2b3647");
    },
    storePinStatus: function(status) {
        $.cookie('sidebar_pinned', status, { expires: 365, path: '/' });
    },
    addToggleButton: function() {
        var $button = $('<span>')
          .addClass('sidebar-container-toggle sidebar-header-menu-icon icon-menu sidebar-toggle');

        $('#container').prepend($button);
    },
    run: function() {
        var $sidebar = this.$sidebar;

        new SideBarApplicationPinning($sidebar).run();
        new SideBarBookmarks($sidebar).run();

        try {
            this.initScrollBars($sidebar);
            this.addToggleButton();
            this.initSideBarToggle();
            this.initPinSideBar($sidebar);
            this.menuToggle();
        } catch (e) {
            console.error(e, e.stack);
        }

        $sidebar.addClass('initialized');
    }
};

$(document).ready(function() {
    $('.sidebar').each(function() {
        new SideBar($(this)).run();
    });
});

module.exports = new SideBar();