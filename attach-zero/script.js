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

const defVal = `{| class="wikitable"
|-
! 序号 !! 标题 !! 配信日 !! 规格 !! 试听
|-
! 1st
| '''[[人型|{{lj|ヒトガタ}}]]''' || 2019年1月9日 || 音乐配信 || <sm2>File:HIMEHINArenxing.mp3</sm2>
|-
! 2nd
| '''{{lj|[[姬雏鸟|ヒバリ]]}}''' || 2019年7月1日 || 音乐配信 || <sm2>File:HIMEHINAyunque.mp3</sm2>
|-
! 3rd
| '''{{lj|[[泡沫啊请不要离去|うたかたよいかないで]]}}''' || 2019年9月11日 || 音乐配信 || <sm2>File:【HIMEHINA】paomo.mp3</sm2>
|-
! 4th
| '''{{lj|[[琥珀的身体|琥珀の身体]]}}''' || 2019年11月29日 || 音乐配信 || <sm2>File:HIMEHINAhupodeshenti.mp3</sm2>
|}

是的，我就是有私心（滑稽）`;
const raw = $("#raw");
raw.val(defVal);
raw.css("height", raw.prop("scrollHeight") + 3 + "px");
raw.on("input", function() {
    raw.css("height", "");
    raw.css("height", raw.prop("scrollHeight") + 3 + "px");
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
    // s = s.split(/\r?\n/).filter(Boolean);
    s = s.split(/\r?\n/);

    let res = [];

    $.each(s, function(index, value) {
        let unp = value.match(/\d\d\d\d年\d?\d月\d?\d日/g);
        if (Array.isArray(unp) && unp.length) {
            $.each(unp, function(i, v) {
                let t1 = v.split("年");
                let t2 = t1[1].split("月");
                let t3 = t2[1].split("日");

                let y = t1[0], m = t2[0], d = t3[0];
                if (m < 10) {
                    m = "<ins>{{0}}</ins>" + m;
                }
                if (d < 10) {
                    d = "<ins>{{0}}</ins>" + d;
                }

                let rep = y + "年" + m + "月" + d + "日";
                value = value.replace(v, rep);
            });
        }
        res.push(value);
    });

    $("#result").empty();

    $.each(res, function(index, value) {
        $("#result").append(value + "<br />");
    });
    $("#result br").last().remove();
});