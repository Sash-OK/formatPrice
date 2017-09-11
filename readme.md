# PriceFormat

 [Demo page](https://sash-ok.github.io/priceFormat/)

Запрещает вводить и вставлять буквы и символы в текстовое поле, только цифры и знак разделения "." или ","

```bash
npm install price-format
```

## Подключение

```html
<!-- Требуется библиотека JQuery 1.12.4 и выше -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/1.12.4/jquery.min.js"></script>
<script src="js/formatPrice.js"></script>
```

## Начальная инициализация

```javascript
$(document).ready(function(){
  $(selector).formatPrice();
});
```

### Параметры

```javascript
$(selector).formatPrice({
    valLen: 10, // Количество чисел до разделителя (Default: 9)
    delim: '.', // Разделитель, возможны 2 значения "." или "," (Default: '.')
    decimal: 4, // Количество чисел после разделителя (Default: 2)
    maxValue: 12000000.99 // Максимальное вводимое значение (Default: false)
});
```

Можно задавать параметры через HTML атрибуты

```html
<input type="text"
       value="97,99"
       class="form-control"
       data-format-price-maxlength="3"
       data-format-price-maxvalue="100.00"
       data-format-price-delimiter="."
       data-format-price-decimals="2">
```