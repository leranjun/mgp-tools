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
Set placeholder value for textarea
 */

const rawVal = `01. 約束の血|1:29
02. Int:Existense|0:03
03. 藍の華|3:46
04. ヒトガタRock|3:42
05. ヒバリ(Laugh-In)|4:21
06. ライライラビットテイル|4:10
07. Int:Electron|1:42
08. 琥珀の身体(Message-In)|4:21
09. Int:Honey|0:34
10. 溺れるほど愛した花|3:38
11. 夢景色|5:01
12. うたかたよいかないで(Message-In)|4:46
13. Int:Dream Away|0:03
14. ララ|4:24
15. Int:NamidaGanges|0:50
16. アダムとマダム|3:56
17. ヒトガタ|3:44
18. Int:What i am|0:29
19. My Dear|6:29`;
const extraVal = `|music_credits = yes
|lyrics_credits = yes
|arranger_credits = yes

|all_lyrics = ゴゴ`;
const raw = $("#raw");
const extra = $("#extra");
raw.val(rawVal);
raw.css("height", raw.prop("scrollHeight") + 3 + "px");
raw.on("input", function() {
    raw.css("height", "");
    raw.css("height", raw.prop("scrollHeight") + 3 + "px");
});
extra.val(extraVal);
extra.css("height", extra.prop("scrollHeight") + 3 + "px");
extra.on("input", function() {
    extra.css("height", "");
    extra.css("height", extra.prop("scrollHeight") + 3 + "px");
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

/*
Main
 */
$("#submit").click(function() {
    let s = raw.val();

    if (!s) {
        return;
    }

    s = s.split(/\r?\n/).filter(Boolean);

    const sliceTop = $("#slice-top").val();
    const brackets = $("#process-brackets").prop("checked"), lj = $("#include-lj").prop("checked");

    let res = ["{{tracklist"];
    res.push(extra.val());
    res.push("");

    $.each(s, function(index, value) {
        if (!value) {
            return;
        }
        index++;

        let unp = value.split("|");
        let cur = {
            title: "",
            note: "",
            time: "",
            music: "",
            lyrics: "",
            arranger: "",
            singer: ""
        };

        cur.title = unp[0].trim().slice(sliceTop).trim();
        cur.time = unp[1].trim();
        if (unp.length > 2) {
            cur.music = unp[2];
            cur.lyrics = (unp[3]) ? (unp[3]) : "";
            cur.arranger = (unp[4]) ? (unp[4]) : "";
            cur.singer = (unp[5]) ? (unp[4]) : "";
        }
        if (brackets) {
            let del = "";
            if (cur.title.includes("(")) {
                del = "(";
            } else if (cur.title.includes("（")) {
                del = "（";
            }
            if (del) {
                let t = cur.title.split(del);
                cur.title = t[0].trim();
                cur.note = t[1].slice(0, -1).trim();
            }
        }
        if (lj) {
            cur.title = "{{lj|" + cur.title + "}}";
            if (cur.note) {
                cur.note = "{{lj|" + cur.note + "}}";
            }
        }

        $.each(cur, function(key, value) {
            if (key !== "time") {
                if (value) {
                    res.push("|" + key + index + "=" + value);
                }
            } else {
                res.push("|length" + index + "=" + value);
            }
        });

        res.push("");
    });

    const result = $("#result");
    result.empty();

    $.each(res, function(index, value) {
        result.append(value + "<br />");
    });
    $("#result br").last().remove();
    result.append("}}");
});

$(".clearButton").click(function() {
    const target = $("#" + $(this).data("target"));
    target.val("");
    target.css("height", "54px");
});