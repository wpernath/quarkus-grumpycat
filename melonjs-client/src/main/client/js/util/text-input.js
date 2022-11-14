import { Renderable, video } from "melonjs/dist/melonjs.module.js";
import $ from "jquery";

export class TextInput extends Renderable {
    constructor(x, y, type, length, def) {
 
        super(x, y, length, 16);

        this.$input = $('<input type="' + type + '" required value="' + def + '">').css({
            "left" : x,
            "top" : y,
            "position": "absolute",
            "z-index": "2",
        });

        switch (type) {
        case "text":
            this.$input
                .attr("maxlength", length)
                .attr("pattern", "[a-zA-Z0-9_\-]+");
            break;
        case "number":
            this.$input.attr("max", length);
            break;
        }

        $(video.getParent()).append(this.$input);
    }

    onDestroyEvent() {
        this.$input.remove();
    }
};