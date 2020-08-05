/*
Setup:
i18n & language switch
 */

$(function() {
    $.i18n().load({
        'en': 'i18n/en.json',
        'zh-hans': 'i18n/zh-hans.json'
    }).done(function() {
        translateAll(); // Start translation
        $(".lang-switch").click(function() {
            $.i18n().locale = $(this).data("locale");
            translateAll(); // Translate again
        });
    });
});

/*
Function:
Translate everything
 */
function translateAll() {
    $("html").i18n(); // Translate again
    $("*[data-i18n='tracklist'], *[data-i18n='attach-zero']").each(function() {
        const txt = $(this).text();
        $(this).html(txt);
    });
}