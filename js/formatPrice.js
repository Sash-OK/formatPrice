(function ($) {

    $.fn.formatPrice = function (options) {

        var settings = $.extend({
                valLen: 9,
                delim: '.',
                decimal: 2,
                maxValue: false
            }, options),

            hasDelim = function (text, delim) {
                return text.indexOf(delim) !== -1;
            },

            delMultiZero = function (text) {

                if (/^0+/.test(text)) {

                    if (/(^0+)([1-9])/.test(text)) {
                        text = text.replace(/(^0+)/, '');
                    } else {
                        text = text.replace(/(^0+)/, '0');
                    }
                }

                return text;
            },

            getChar = function (e) {

                if (e.which === null || e.which === undefined) { // IE

                    // спец. символ
                    if (e.keyCode < 32) {
                        return;
                    }

                    return String.fromCharCode(e.keyCode);
                }

                // все кроме IE
                if (e.which !== 0 && e.charCode !== 0) {
                    // спец. символ
                    if (e.which < 32) {
                        return;
                    }

                    // остальные
                    return String.fromCharCode(e.which);
                }

                // спец. символ
                return;
            },

            addZeroes = function (string, num) {
                if (!num) {
                    return string;
                }

                string += '0';

                return addZeroes(string, --num);
            },

            isBiggerThenMaxValue = function (valueStr, char, cursorPos, maxValue) {
                var beforeChar = valueStr.slice(0, cursorPos),
                    afterChar = valueStr.slice(cursorPos),
                    futureValue = beforeChar + char + afterChar;

                return parseFloat(futureValue) > maxValue;
            },

            insertChar = function (input, delim) {
                var val = input.value,
                    iePos = {},
                    cursorPos,
                    endPos;

                if (input.createTextRange) {

                    iePos.ieRange = document.selection.createRange();
                    iePos.ieTextInputRange = input.createTextRange();
                    iePos.iePrevRange = input.createTextRange();
                    iePos.ieBookmark = iePos.ieRange.getBookmark();
                    iePos.ieTextInputRange.moveToBookmark(iePos.ieBookmark);
                    iePos.iePrevRange.setEndPoint('EndToStart', iePos.ieTextInputRange);
                    cursorPos = iePos.iePrevRange.text.length;
                    endPos = cursorPos + iePos.ieRange.text.length;
                    input.value = val.slice(0, cursorPos) + delim + val.slice(endPos);
                    cursorPos++;

                    // Move the caret
                    iePos.ieTextInputRange = input.createTextRange();
                    iePos.ieTextInputRange.collapse(true);
                    iePos.ieTextInputRange.move('character', cursorPos - (input.value.slice(0, cursorPos).split('\r\n').length - 1));
                    iePos.ieTextInputRange.select();

                } else {

                    cursorPos = input.selectionStart;
                    endPos = input.selectionEnd;

                    input.value = val.slice(0, cursorPos) + delim + val.slice(endPos);
                    input.selectionStart = input.selectionEnd = cursorPos + 1;
                }
            },

            formatValue = function (val, delim, valLen, decimal, maxValue) {
                var reg = new RegExp('\\d{1,' + valLen + '}(\\' + delim + '\\d{1,' + decimal + '})?'),
                    clearDot = new RegExp('(\\' + delim + '+)', 'g'),
                    result;

                val = val.replace(/[^\d.,]/g, '');
                val = val.replace(/([,+\.+])/g, delim);
                val = val.replace(clearDot, delim);
                result = val.match(reg);

                if (result) {

                    if (hasDelim(result[0], delim)) {
                        result = result[0].split(delim);
                    }

                    result[0] = delMultiZero(result[0]);

                    if(result[1]) {

                        return result[0] + delim + addZeroes(result[1], decimal - result[1].length);
                    } else {

                        return result[0] + delim + addZeroes('', decimal);
                    }
                } else {

                    return '';
                }
            };

        return this.each(function () {
            var htmlData = $(this).data(),
                options = {},
                valLen,
                maxValue,
                decimal,
                delim;

            if (htmlData.formatPriceMaxlength && !isNaN(htmlData.formatPriceMaxlength)) {
                options.valLen = parseInt(htmlData.formatPriceMaxlength);
            }
            if (htmlData.formatPriceMaxvalue && !isNaN(htmlData.formatPriceMaxvalue)) {
                options.maxValue = parseInt(htmlData.formatPriceMaxvalue);
            }

            if (htmlData.formatPriceDelimiter) {
                options.delim = htmlData.formatPriceDelimiter;
            }

            if (htmlData.formatPriceDecimals && !isNaN(htmlData.formatPriceDecimals)) {
                options.decimal = parseInt(htmlData.formatPriceDecimals);
            }

            options = $.extend({}, settings, options);

            valLen = options.valLen;
            decimal = options.decimal;
            delim = options.delim;
            maxValue = options.maxValue || false;

            this.value = formatValue(this.value, delim, valLen, decimal, maxValue);

            this.onblur = function () {

                this.value = formatValue(this.value, delim, valLen, decimal);
            };

            this.onpaste = function (e) {
                var data = e ? e.clipboardData : window.clipboardData,
                    text = data.getData('Text');

                this.value = formatValue(text, delim, valLen, decimal);
                return false;
            };

            this.onkeyup = function () {
                var val = this.value;

                if (!hasDelim(val, delim) && val.length > valLen) {

                    val = val.slice(0, valLen - val.length);

                    if (maxValue && parseInt(val) > maxValue) {
                        val = maxValue;
                    }
                    this.value = val;
                }
            };

            this.onkeypress = function (e) {
                var e = e || event,
                    val = this.value,
                    char = getChar(e),
                    iePos = {},
                    cursorPos;

                if (e.ctrlKey || e.altKey) {
                    return;
                }

                // Определение положения курсора
                if (this.createTextRange) {
                    // IE < 9
                    iePos.ieRange = document.selection.createRange();
                    iePos.ieTextInputRange = this.createTextRange();
                    iePos.iePrevRange = this.createTextRange();
                    iePos.ieBookmark = iePos.ieRange.getBookmark();
                    iePos.ieTextInputRange.moveToBookmark(iePos.ieBookmark);
                    iePos.iePrevRange.setEndPoint('EndToStart', iePos.ieTextInputRange);

                    cursorPos = iePos.iePrevRange.text.length;
                } else {
                    // Остальные браузеры
                    cursorPos = this.selectionStart;
                }

                if (!char) {
                    return;
                }

                if (hasDelim(val, delim)) {

                    val = val.split(delim);

                    if (char < '0' || char > '9') {

                        return false;
                    }

                    if (val[0].length >= cursorPos && val[0].length > valLen - 1) {

                        return false;
                    }

                    if (cursorPos > val[0].length && val[1].length > decimal - 1) {

                        return false;
                    }

                    if (maxValue && isBiggerThenMaxValue(val[0] + delim + val[1], char, cursorPos, maxValue)) {

                        return false;
                    }

                } else {

                    if ((char !== ',' && char !== '.' && char < '0') || (char !== ',' && char !== '.' && char > '9')) {

                        return false;
                    }

                    if (val.length > valLen - 1 && !(char === ',' || char === '.')) {

                        return false;
                    }

                    if ((char === ',' || char === '.') && (cursorPos + decimal >= val.length)) {

                        insertChar(this, delim);
                        return false;
                    }

                    if (maxValue && isBiggerThenMaxValue(val, char, cursorPos, maxValue)) {

                        return false;
                    }
                }
            };
        });
    };
}(jQuery));