/*
Setup:
i18n & language switch
 */

$(function() {
    $.i18n().load({
        'en': 'i18n/en.json',
        'zh-hans': 'i18n/zh-hans.json'
    }).done(function() {
        const l = Cookies.get("locale");
        if (l) {
            $.i18n().locale = l;
        }
        // else {
        //     Cookies.set("locale", $.i18n().locale);
        // }
        translateAll(); // Start translation
        $(".lang-switch").click(function() {
            const l = $(this).data("locale");
            Cookies.set("locale", l);
            $.i18n().locale = l;
            translateAll(); // Translate again
        });
        $("#removeCookies").click(function() {
            const self = $(this);
            self.css("pointer-events", "none");
            Cookies.remove("locale");
            self.fadeOut(100, function() {
                self.text("done");
                self.data("i18n", "done");
                self.i18n();
            });
            self.fadeIn(100);
            setTimeout(function() {
                self.fadeOut(100, function() {
                    self.text("remove-cookies");
                    self.data("i18n", "remove-cookies");
                    self.i18n();
                    self.css("pointer-events", "auto");
                });
                self.fadeIn(100);
            }, 3000);
        })
    });
});

/*
Function:
Translate everything
 */
function translateAll() {
    $("html").i18n();
    $("*").each(function() {
        const self = $(this);
        if (self.data("i18n")) {
            const txt = $(this).text();
            if (txt.includes("&#")) {
                $(this).html(txt);
            }
        }
    });
}