/**
 * Created by Aaron Allen on 8/20/2016.
 */

define([
    'jquery',
    'uiClass'
], function ($, Class) {
    'use strict';

    return Class.extend({
        initialize: function (config, element) {
            this._initMenu(config.menu);
            this.element = $(element).empty().css({position: 'relative', overflow: 'hidden'});
            this.draw(config.menu['Default Category']['Products'], 'none'); // show the root category
            this._super();

            // make menu sticky
            var sideBar = $('.sidebar-main'),
                sideBarTop = $('.main').offset().top, //sideBar.offset().top,
                //sidebarWidth = sideBar.css('width'),
                sidebarHeight = sideBar.height();

            var footer = $('.page-footer'),
                footerTop = footer.offset().top;

            // update sidebar vars on window resize
            $(window).resize(function (e) {
                //sidebarWidth = sideBar.css('width');
                sidebarHeight = sideBar.height();
                footerTop = footer.offset().top;
                sideBarTop = $('.main').offset().top;//sideBar.offset().top;
            });

            // scroll handler. static until scroll below header. static when hits top of footer
            $(window).on('scroll', function () {
                if (footer[0].getBoundingClientRect().top - sidebarHeight <= 0) {
                    sideBar.css({top: footerTop - sidebarHeight, position: 'absolute'});
                } else if ((window.scrollY >= sideBarTop && sideBar.css('position') !== 'fixed') ||
                    (sideBar.css('position') === 'absolute' && window.scrollY < sideBar.offset().top) // scrolling up from footer
                ) {
                    sideBar.css({position: 'fixed', top: 0});

                } else if (window.scrollY < sideBarTop && sideBar.css('position') === 'fixed') {
                    sideBar.css('position', 'static');
                }
            });
        },

        // add method to get parent for each category object and set category name
        _initMenu: function (menu) {
            for (var key in menu) {
                if (!menu.hasOwnProperty(key)) continue;

                if (typeof menu[key] === 'object') {
                    menu[key].parent = function () {
                        return menu;
                    };

                    if (menu.name) {
                        menu[key].name = key.replace(/\*/g, "'"); // rehydrate '
                    }else menu[key].name = 'Root'; // title for root category

                    this._initMenu(menu[key]);
                }
            }
        },

        // draw a category
        draw : function (category, direction) {
            var self = this;

            // animate the old category, if exists
            var prevDiv;
            if (prevDiv = this.element.children().first()) {
                // slide out of view
                prevDiv.animate({left: prevDiv.width() * (direction === 'forward'?-1:1)}, this.duration, function () {this.remove();});
            }

            var container = $('<div>').addClass('side-menu'); // div that holds the menu elements

            // breadcrumbs
            var parentCat = category,
                breadCrumbs = $('<span>').addClass('breadcrumb').appendTo(container);
            while (parentCat.parent().parent().parent && (parentCat = parentCat.parent()) && parentCat.name) {
                // build the list of crumbs
                if (breadCrumbs.children().length)
                    breadCrumbs.prepend(document.createTextNode(' \u203A '));

                breadCrumbs.prepend(
                    $('<a href="#">').click(
                        bindToLink.bind(this, parentCat, 'back')
                    ).text(parentCat.name)
                );
            }

            $('<h3>').text(category.name).appendTo(container); // title

            // add back button if not top level
            if (category.parent().parent().parent) {

                var back = $('<a href="#">')
                    .click(bindToLink.bind(this, category.parent(), 'back'))
                    .text('Back')
                    .addClass('back-link');

                container.append(back);
            }

            var linkList = $('<ul>').appendTo(container);

            // create links
            for (var key in category) {
                if (!category.hasOwnProperty(key) || key === 'parent' || key === 'name') continue;

                var link;

                if (typeof category[key] === 'object') { // open child category
                    link = $('<a href="#">').click(bindToLink.bind(this, category[key], 'forward')); // rehydrate apostrophes
                } else if (typeof category[key] === 'string') { // product link
                    link = $('<a>').attr('href', category[key]);
                }

                var item = $('<li>').text(key.replace(/\*/g, "'"));
                link.append(item).appendTo(linkList);
            }

            // the link click handler
            function bindToLink(category, direction, e) {
                e.preventDefault();

                self.draw(category, direction);

                return false;
            }

            // add window resize event to container to control container width and element height
            $(window).resize(function (e) {
                container.css('width', self.element.width());
                self.element.css('height', Math.max(container.height(), self.element.height()));
            });

            this.element.append(container);

            // animate the new category
            if (direction === 'none') { // no animation
                container.css({position: 'absolute', width: this.element.width()});
            } else {
                // slide into view
                container.css({
                    position: 'absolute',
                    left: container.width() * (direction === 'forward'?1:-1),
                    width: this.element.width()
                }).animate({left: 0}, this.duration);
            }

            this.element.css('height', Math.max(container.height(), self.element.height()));
        },

        element : null,

        duration : 250 // duration of animations
    });

});