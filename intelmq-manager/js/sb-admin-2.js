$(function() {

    $('#side-menu').metisMenu();

});

//Loads the correct sidebar on window load,
//collapses the sidebar on window resize.
// Sets the min-height of #page-wrapper to window size
$(function() {
    $(window).bind("load resize", function() {
        topOffset = 50;
        width = (this.window.innerWidth > 0) ? this.window.innerWidth : this.screen.width;
        if (width < 768) {
            $('div.navbar-collapse').addClass('collapse')
            topOffset = 100; // 2-row-menu
        } else {
            $('div.navbar-collapse').removeClass('collapse')
        }

        height = (this.window.innerHeight > 0) ? this.window.innerHeight : this.screen.height;
        height = height - topOffset;
        if (height < 1) height = 1;
        if (height > topOffset) {
            $("#page-wrapper").css("min-height", (height) + "px");
        }
    })
})

// Resize body
var body = document.getElementsByTagName('body')[0];
body.style.height = window.innerHeight + "px";
body.style.overflowX = "auto";
body.style.overflowY = "auto";

var container = document.getElementById('page-wrapper-with-sidebar') || document.getElementById('page-wrapper');
container.style.height = (window.innerHeight - container.offsetTop) + "px";
container.style.overflowX = "auto";
container.style.overflowY = "auto";