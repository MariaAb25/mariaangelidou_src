jQuery(function () {
    // Sets current page as active in header nav

    const path = this.location.pathname;
    if ( ( path == '' ) || ( path == '/' ) || path.includes('project') ){
        $('.navbar-nav a[href="/projects.html"]').parent().addClass('active');
    }

    else{
        $('.navbar-nav a[href="' + this.location.pathname + '"]').parent().addClass('active');
    }
});