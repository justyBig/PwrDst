var donationGoal = 5000;
var donationTotal = 3500;
var numDonations = 5000 / 50;
var amountInput = $('#donationAmount');
var donors = $('#donors');
var progressBar = $('.progress_bar');
var hoverMessage = $('#remaining');
/*========================================================================
        DOCUMENT READY
========================================================================*/
// This document ready syntax supports use of the $ alias in jQuery no conflict mode. See README.md for more info and alternatives.
jQuery(document).ready(function ($) {
    progressBar.width((donationTotal * 100) / donationGoal + '%');

    $('#donate_btn').on('click', function () {
        var donationAmount = parseInt(amountInput.val());
        if (donationAmount < 1) {
            amountInput.val(50);
            return;
        }
        if (donationTotal + donationAmount > donationGoal) {
            amountInput.val(Math.abs(donationGoal - donationTotal));
            amountInput.attr('max', Math.abs(donationGoal - donationTotal));
            return;
        }

        var newWidth = ((donationTotal + donationAmount) * 100) / donationGoal;
        progressBar.width(newWidth + '%');
        donationTotal += donationAmount;
        numDonations += 1;
        donors.html(parseInt(donors.html()) + 1);
        hoverMessage.html(donationGoal - donationTotal);
        if (donationTotal >= donationGoal) {
            goalComplete();
        }
    });
    $('.module__progress').hover(
        function () {
            console.log('in');
            $('.txtBubble').addClass('show');
        },
        function () {
            $('.txtBubble').removeClass('show');
        }
    );

    $('.whyLink').on('click', function (e) {
        e.preventDefault();
        if ($(this).attr('data-click-state') == 1) {
            showBack();
        } else {
            showFront();
        }
    });
}); // end no-conflict document ready

function goalComplete(params) {
    $('.front .module__content').html(
        '<h2 class="complete"> We DID it!!!</h2>'
    );
    progressBar.addClass('complete');
}
function showBack() {
    $('.front').css('transform', 'perspective(600px) rotateY(0deg)');
    $('.back').css('transform', 'perspective(600px) rotateY(180deg)');
}

function showFront() {
    $('.back').css('transform', 'perspective(600px) rotateY(0)');
    $('.front').css('transform', 'perspective(600px) rotateY(-180deg)');
}

/*========================================================================
        WINDOW LOAD
========================================================================*/
jQuery(window).on('load', function (e) {}); // end: Window Load - no-conflict

/*========================================================================
        WINDOW RESIZE
========================================================================*/
jQuery(window).on('resize', function (e) {}); // end: window resize
