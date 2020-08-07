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
        $("html").i18n(); // Start translation
        $(".lang-switch").click(function() {
            const l = $(this).data("locale");
            Cookies.set("locale", l);
            $.i18n().locale = l;
            $("html").i18n(); // Translate again
        });
    });
});

/*
Setup:
Set placeholder value for textarea
 */

const rawVal = `01. 約束の血|1:29|约束之血|ゴゴ||大山彻也
02. Int:Existense|0:03
03. 藍の華|3:46|#同名歌曲|马渕直纯||马渕直纯
04. ヒトガタRock|3:42|人型Rock|南田健吾||猫舌ロロ+泽头たかし（DORA）
05. ヒバリ(Laugh-In)|4:21|姬雏鸟|大田原侑树||泽头たかし（DORA）+大山彻也
06. ライライラビットテイル|4:10|来来兔尾草|秋浦智裕||秋浦智裕
07. Int:Electron（Introduction from TheAmbroid）|1:42||柴山太朗
08. 琥珀の身体(Message-In)|4:21|琥珀的身体|柴山太朗&ゴゴ||柴山太朗
09. Int:Honey|0:34
10. 溺れるほど愛した花|3:38|让人为之迷恋的爱之花|南田健吾||南田健吾
11. 夢景色|5:01|梦中景色|冈本武士||秋浦智裕
12. うたかたよいかないで(Message-In)|4:46|泡沫啊请不要离去|Motokiyo||Motokiyo
13. Int:Dream Away|0:03
14. ララ|4:24|LaRa|草野よしひろ||草野よしひろ
15. Int:NamidaGanges|0:50||南田健吾
16. アダムとマダム|3:56|亚当和夫人|南田健吾||南田健吾
17. ヒトガタ|3:44|人型|南田健吾||南田健吾
18. Int:What i am|0:29
19. My Dear|6:29|亲爱的(HIMEHINA)|キクイケタロウ||秋浦智裕`;
const extraVal = `|music_credits=yes
|arranger_credits=yes

|all_singer=HIMEHINA
|all_lyrics=ゴゴ`;
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

let autolink = "";

/*
Main
 */
$("#autolink").on("change", function() {
    const selector = $("span[data-i18n='raw']");
    autolink = $("#autolink").val();
    if (autolink === "off") {
        selector.text("raw");
        selector.data("i18n", "raw");
        selector.i18n();
    } else {
        selector.text("raw-autolink");
        selector.data("i18n", "raw-autolink");
        selector.i18n();
    }
});

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
            link: "",
            music: "",
            lyrics: "",
            arranger: "",
            singer: ""
        };

        cur.title = unp[0].trim().slice(sliceTop).trim();
        cur.time = (unp[1]) ? (unp[1].trim()) : "";
        if (autolink === "no") {
            cur.music = (unp[2]) ? (unp[2].trim()) : "";
            cur.lyrics = (unp[3]) ? (unp[3].trim()) : "";
            cur.arranger = (unp[4]) ? (unp[4].trim()) : "";
            cur.singer = (unp[5]) ? (unp[5].trim()) : "";
        } else {
            cur.link = (unp[2]) ? (unp[2].trim()) : "";
            cur.music = (unp[3]) ? (unp[3].trim()) : "";
            cur.lyrics = (unp[4]) ? (unp[4].trim()) : "";
            cur.arranger = (unp[5]) ? (unp[5].trim()) : "";
            cur.singer = (unp[6]) ? (unp[6].trim()) : "";
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

        if (autolink === "auto") {
            cur.link = cur.title;
        }

        $.each(cur, function(key, value) {
            if (key === "time") {
                res.push("|length" + index + "=" + value);
            } else if (key !== "link") {
                if (value) {
                    if (lj) {
                        value = "{{lj|" + value + "}}";
                    }
                    if (key === "title") {
                        if (cur.link) {
                            value = "[[" + cur.link + "|" + value + "]]";
                        }
                    }
                    res.push("|" + key + index + "=" + value);
                }
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