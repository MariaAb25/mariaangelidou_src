jQuery(function () {
    // Sets current page as active in header nav

    const path = this.location.pathname;
    if ( ( path == '' ) || ( path == '/' ) || path.includes('project') ){
        $('.navbar-nav a[href="/projects.html"]').parent().addClass('active');
    }

    else{
        $('.navbar-nav a[href="' + this.location.pathname + '"]').parent().addClass('active');
    }

    // Img animation
    $( '.project-cover img' ).css('opacity', '1');

    $( '.projects-inner .main' ).css('opacity', '1');

    ScrollReveal().reveal('.projects-inner .main img', {
        delay: 1200,
        useDelay: 'onload',
        reset: true,
        mobile: false
    });

    ScrollReveal().reveal('.projects-inner .main img:first-child', {
        delay: 0,
        interval: 80,
        mobile: false
    })
});

