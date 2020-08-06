/*
RegEx Patterns

(19|20)\d\d-?(0[1-9]|1[0-2])-?([0-2]\d|3[0-1])T([0-1]\d|2[1-3]):?[0-5]\d:?[0-5]\dZ

(Sun|Mon|Tue|Wed|Thu|Fri|Sat), ([0-2]\d|3[0-1]) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) (19|20)\d\d ([0-1]\d|2[1-3]):[0-5]\d:[0-5]\d

(Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday), (\d|[1-2]\d|3[0-1])-(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)-\d\d ([0-1]\d|2[1-3]):[0-5]\d:[0-5]\d

(Sun|Mon|Tue|Wed|Thu|Fri|Sat) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) ([0-2]\d|3[0-1]) ([0-1]\d|2[1-3]):[0-5]\d:[0-5]\d (19|20)\d\d

(19|20)\d\d-?(0[1-9]|1[0-2])-?([0-2]\d|3[0-1]) ?([0-1]\d|2[1-3]):?[0-5]\d:?[0-5]\d((\-(0\d|1[0-2]))|(\+((0\d)|(1[0-4]))))?

([0-2]\d|3[0-1])-(0[1-9]|1[0-2])-(19|20)\d\d ([0-1]\d|2[1-3]):[0-5]\d:[0-5]\d(\.\d{6})?

(19|20)\d\d:(0[1-9]|1[0-2]):([0-2]\d|3[0-1]) ([0-1]\d|2[1-3]):[0-5]\d:[0-5]\d)

 */

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
        translateAll(); // Start translation
        $(".lang-switch").click(function() {
            const l = $(this).data("locale");
            Cookies.set("locale", l);
            $.i18n().locale = l;
            translateAll(); // Translate again
        });
    });
});

/*
Setup:
Initiate date inputs
 */

const d = new Date();
const st = d.getFullYear() + "-" + leading0(d.getMonth() + 1) + "-" + leading0(d.getDate()) + " 00:00:00"; // Default starting time
$("#query-start-time").val(st);
const et = d.getFullYear() + "-" + leading0(d.getMonth() + 1) + "-" + leading0(d.getDate()) + " 23:59:59"; // Default ending time
$("#query-end-time").val(et);

/*
Variables:
Base
 */

let count = {
    zh: -1,
    en: -1,
    ja: -1,
    cm: -1,
    lib: -1,
    total: 0
};
let url = {
    zh: "https://zh.moegirl.org.cn/api.php?origin=*",
    en: "https://en.moegirl.org.cn/api.php?origin=*",
    ja: "https://ja.moegirl.org.cn/api.php?origin=*",
    cm: "https://commons.moegirl.org.cn/api.php?origin=*",
    lib: "https://library.moegirl.org.cn/api.php?origin=*"
};

/*
Function:
Translate everything
 */
function translateAll() {
    $("html").i18n();
    $.each(count, function(key, value) {
        const spanID = "#count-" + key;
        $(spanID).i18n();
        if (key !== "total" && value !== -1) {
            $(spanID).text(value);
        }
    });
}


/*
Function:
Add CORS prefix
 */

function addCors(url, method) {
    const corsPre = [
        "https://cors-anywhere.herokuapp.com",
        "https://cors-anywhere.azurewebsites.net",
        "https://lr-cors-anywhere.azurewebsites.net"
    ]; // List of cors-anywhere servers
    if (method > corsPre.length) return "error";
    if (method === 1) {
        // Pre-process URL
        const t = url.split("/");
        url = t[2] + ":443/";
        for (let i = 3; i < t.length; i++) {
            url += t[i] + "/";
        }
        url = url.slice(0, -1);
    }
    return corsPre[method] + "/" + url;
}

/*
Function - Promise:
Fetch the contribution list from the APIs.
 */
function fetchContribList(url, method = 0) {
    const newUrl = addCors(url, method);
    if (newUrl !== "error") {
        return fetch(newUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error("HTTP error " + response.status);
                }
                return response.json();
            })
            .then(response => {
                return response["query"]["usercontribs"];
            })
            .catch(() => fetchContribList(url, method + 1));
    } else {
        return "error";
    }
}

/*
Function:
Add leading zeros to month/date
 */
function leading0(s) {
    return ('0' + s).slice(-2);
}

/*
Main
 */
$("#submit").click(function() {
    let ucstart = $("#query-end-time").val();
    let ucend = $("#query-start-time").val();
    const ucuser = $("#query-username").val();

    if (!ucstart || !ucend || !ucuser) {
        return;
    }

    // Reset count
    count = {
        zh: -1,
        en: -1,
        ja: -1,
        cm: -1,
        lib: -1,
        total: 0
    };

    const total = $("#count-total");
    total.text("loading");
    total.data("i18n", "loading");
    total.i18n();

    const siteList = $("#site-list");
    const countH = $("#count-h");
    if (!$("#query-h").prop("checked")) {
        count.h = -1;
        url.h = "https://www.hmoegirl.com/api.php?origin=*";
        if (!countH.length) {
            siteList.append('<li><span data-i18n="count-h">count-h</span><span id="count-h" data-i18n="loading">loading</li>');
            siteList.i18n();
        }
    } else {
        if (count.hasOwnProperty("h")) {
            delete count.h;
        }
        if (url.hasOwnProperty("h")) {
            delete url.h;
        }
        if (countH.length) {
            countH.parent().remove();
        }
    }

    // Pre-process date, opposite way
    ucstart = ucstart.split(" ");
    ucstart = new Date(ucstart[0] + "T" + ucstart[1]).toISOString();

    ucend = ucend.split(" ");
    ucend = new Date(ucend[0] + "T" + ucend[1]).toISOString();

    const queryString = {
        "action": "query",
        "format": "json",
        "list": "usercontribs",
        "uclimit": "max",
        "ucstart": ucstart,
        "ucend": ucend,
        "ucuser": ucuser
    };

    /*
    Section:
    Add extra query strings to the URL
     */
    $.each(url, function(key) {
        const spanID = "#count-" + key;
        $(spanID).text("loading");
        $(spanID).data("i18n", "loading");
        $(spanID).i18n();
        $.each(queryString, function(qk, qv) {
            url[key] += ("&" + qk + "=" + qv);
        });
    });

    /*
    Section - Promise:
    Update count content
     */
    Promise
        .all(Object.entries(url).map(([key, value]) =>
            fetchContribList(value)
                .then(list => {
                    if (list === "error") {
                        const spanID = "#count-" + key;
                        $(spanID).addClass("error");
                        $(spanID).text("error-timeout");
                        $(spanID).data("i18n", "error-timeout");
                        $(spanID).i18n();
                    } else {
                        if ($.isEmptyObject(list)) {
                            count[key] = 0;
                        } else {
                            const curCount = Object.keys(list).length;
                            count[key] = curCount;
                            count.total += curCount;
                        }

                        const spanID = "#count-" + key;
                        $(spanID).data("i18n", "");
                        $(spanID).text(count[key]);
                    }
                })
        ))
        .then(() => {
            total.data("i18n", "");
            total.text(count.total);
        })
        .catch(console.error);
});