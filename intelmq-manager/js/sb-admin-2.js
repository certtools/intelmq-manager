$(function() {
    $('#side-menu').metisMenu();
});

//Loads the correct sidebar on window load,
//collapses the sidebar on window resize.
// Sets the min-height of #page-wrapper to window size

function resize_handler() {
    var window_height = (this.window.innerHeight > 0) ? this.window.innerHeight : this.screen.height;
    var window_width = (this.window.innerWidth > 0) ? this.window.innerWidth : this.screen.width;
    
    // Resize body
    var body = document.getElementsByTagName('body')[0];
    body.style.height = window_height + "px";
    body.style.width = window_width + "px";
    body.style.overflowX = "hidden";
    body.style.overflowY = "hidden";

    var container = document.getElementById('page-wrapper-with-sidebar') || document.getElementById('page-wrapper');
    container.style.height = (window_height - container.offsetTop) + "px";
    container.style.width = (window_width - container.offsetLeft) + "px";
    container.style.overflowX = "auto";
    container.style.overflowY = "auto";

    var title_height = (window_height * 0.10);
    $('.page-header-text').css('font-size', title_height + "px");
    $('.page-header-text').css('line-height', (title_height * 2) + "px");
    
    topOffset = 50;
    width = window_width;
    if (width < 768) {
        $('div.navbar-collapse').addClass('collapse')
        topOffset = 100; // 2-row-menu
    } else {
        $('div.navbar-collapse').removeClass('collapse')
    }

    height = window_height;
    height = height - topOffset;
    if (height < 1) height = 1;
    if (height > topOffset) {
        $("#page-wrapper").css("min-height", (height) + "px");
    }
}

$(window).bind("load resize", resize_handler);
