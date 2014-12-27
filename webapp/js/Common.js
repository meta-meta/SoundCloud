define(['underscore'], function (_) {
    'use strict';

    return {
        // ripped from SoundCloud minified javascript
        parseTags: function(track) {
            var i, r = /(\w+)\:(\w+)=(.+)/;

            function t(e) {
                return !r.test(e)
            }

            function parse(e, i) {
                var r, s, o, a = [],
                    l = [],
                    u = !1,
                    c = !0;
                for (i || (i = {}), r = 0, s = e.length; s > r; ++r) o = e.charAt(r), '"' === o ? u = !u : " " === o || "," === o ? u ? l.push(o) : c || (c = !0, a.push(l.join("")), l.length = 0) : (c = !1, l.push(o));
                return c || a.push(l.join("")), a.filter(i.includeMachineTags ? n : t).map(function(e) {
                    return e.replace(/"/g, "").replace(/\s\s+/, " ").trim()
                }).filter(Boolean)
            }

            return parse(track.tag_list);
        }
    };
});