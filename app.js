const maxNonPrintableWidth = 15 // Максимальная ширина непечатаемых полей по краям , см
const minPrintableWidth = 30 // Минимальная ширина печатной области, см

function checkSettings() {
    let isInvalid = false
    $('.settings').each((id, input) => {
        if ($(input).val() <= 0 ) {
            if (!$(input).hasClass('is-invalid')) {
                $(input).addClass('is-invalid')
            }
            isInvalid = true
        } else {
            $(input).removeClass('is-invalid')
        }
    })

    return isInvalid
}

function resetData() {
    $('.null-per-empty-data').text(0)
}

function recalc() {
    const bWidth = parseInt($('#banner_width').val())
    const bHeight = parseInt($('#banner_height').val())
    const settingMaterialWidth = parseInt($('#setting_material_width').val())
    const printableWidth = settingMaterialWidth - parseInt($('#setting_non_printable_width').val()) * 2
    const overspendingPrice = parseFloat($('#setting_overspending_price').val()).toFixed(2)

    if (parseInt($('#setting_non_printable_width').val()) > maxNonPrintableWidth) {
        alert("Ширина непечатаемых полей не может быть больше " + maxNonPrintableWidth + " см")
        resetData()
        return
    }

    if (printableWidth < minPrintableWidth) {
        alert("Ширина печатной области (ширина материала - ширина непечатаемых полей) не может быть меньше " + minPrintableWidth + " см")
        resetData()
        return
    }

    if (checkSettings()) {
        resetData()
        return
    }

    if (!bWidth || !bHeight) {
        resetData()
        return
    }

    // соотношение сторон
    const $banner = $('#banner_visual')
    $banner.height($banner.width() / (bWidth / bHeight))

    // площадь в мм
    const s = Math.ceil(bWidth * bHeight)
    const p = (bWidth + bHeight) * 2 / 1000

    $('#banner_s').text((s / 1e6).toFixed(2))
    $('#banner_p').text(p.toFixed(2))


    materialDensity = parseInt($('#material_density').val())
    printType = parseInt($('#print_type').val())

    // Люверсы
    if ($('#install_luverse').val() !== '0') {
        if (bWidth && bHeight) {
            let firstStep = parseInt(p * 100 / parseInt($('#install_luverse').val()))
            let lastStep = Math.round(firstStep / 2) * 2
            $('#count_luverse').text(lastStep)
            $('#total_install_luverse').text(parseFloat($('#setting_install_luverse_price').val()).toFixed(2) * lastStep)
        }
    } else {
        $('#count_luverse').text(0)
        $('#total_install_luverse').text(0)
    }

    // Карман под утяжелитель
    if ($('#pocket_weighting').val() === 'true') {
        if ($('#setting_pocket_weighting_price').val()) {
            $('#pocket_lenght').text((bWidth / 1000).toFixed(2))
            $('#total_pocket_weighting').text((bWidth / 1000).toFixed(2) * parseFloat($('#setting_pocket_weighting_price').val()).toFixed(2))
        }
    } else {
        $('#pocket_lenght').text(0)
        $('#total_pocket_weighting').text(0)
    }

    // Учет перерасхода и склейки в зависимости от раскроя

    if (bHeight >= (printableWidth * 10) ) {
        let numParts = Math.ceil(bWidth / (printableWidth * 10))
        $('#gluing_parts').text(numParts)
        $('#total_gluing_parts').text(((numParts - 1) * (bHeight / 1000).toFixed(2) * parseFloat($('#setting_gluing_parts_price').val()).toFixed(2)).toFixed(2) )
        $('#maket_orientation_notice').addClass('d-none')
    } else {
        if (bWidth <= (printableWidth * 10) ) {
            //выбираем автоматически оптимальное расположение на холсте
            let minValue = (bWidth > bHeight) ? bHeight : bWidth;
            let maxValue = (bWidth < bHeight) ? bHeight : bWidth;
            let overspendingArea = ((minValue * ((printableWidth * 10) - maxValue)) / 1e6).toFixed(2)

            $('#overspending').text(overspendingArea)
            $('#total_overspending').text((overspendingPrice * overspendingArea).toFixed(2))

            $('#gluing_parts').text(1)
            $('#total_gluing_parts').text(0)

            $('#maket_orientation_notice').addClass('d-none')
        } else {
            $('#maket_orientation_notice').removeClass('d-none')

            if ($('#maket_orientation').val() === 'across') {
                // раскладка поперек
                let numParts = Math.ceil(bWidth / (printableWidth * 10))
                let overspendingArea = ((numParts * (printableWidth * 10) - bWidth) * bHeight / 1e6 ).toFixed(2)

                $('#gluing_parts').text(numParts)
                $('#total_gluing_parts').text(((numParts - 1) * (bHeight / 1000).toFixed(2) * parseFloat($('#setting_gluing_parts_price').val()).toFixed(2)).toFixed(2) )

                $('#overspending').text(overspendingArea)
                $('#total_overspending').text((overspendingPrice * overspendingArea).toFixed(2))
            } else {
                // раскладка повдоль
                let overspendingArea = (bWidth * (printableWidth * 10 - bHeight ) / 1e6).toFixed(2)

                $('#overspending').text(overspendingArea)
                $('#total_overspending').text((overspendingPrice * overspendingArea).toFixed(2))

                $('#gluing_parts').text(1)
                $('#total_gluing_parts').text(0)
            }
        }
    }




    // Вварка фалла и проклейка по периметру
    if ((bWidth >= 3000 && bHeight >= 6000) || (bWidth >= 6000 && bHeight >= 3000)) {
        let pricePerGluingPerimeter = (parseFloat($('#setting_glue_perimeter_price').val()) * p).toFixed(2)
        let pricePerPhallus = (parseFloat($('#setting_phallus_welding_price').val()) * (p + 8) ).toFixed(2)
        let result = Number(pricePerGluingPerimeter) + Number(pricePerPhallus)

        $('#phallus_welding_notice').removeClass('d-none')
        if ($('#phallus_welding').val() === 'true') {
            $('#total_phallus_welding').text(result.toFixed(2))
        } else {
            $('#total_phallus_welding').text(0)
        }
    } else {
        $('#phallus_welding_notice').addClass('d-none')
        $('#total_phallus_welding').text(0)
    }

    // Резка в размер
    if ($('#cutting').val() === 'true') {
        $('#total_product_cutting').text((p * parseInt($('#setting_cutting_price').val())).toFixed(2))
    } else {
        $('#total_product_cutting').text(0)
    }


    $('.alert-info').on('click', function () {
        //$(this).addClass('d-none')
    })

    // стоимость готового изделия
    $('#total_banner').text(((materialDensity + printType) * s / 1e6).toFixed(2))

    // итого стоимость
    $('#total_all').text((parseFloat($('#total_banner').text()) + parseFloat($('#total_product_cutting').text()) + parseFloat($('#total_install_luverse').text()) + parseFloat($('#total_pocket_weighting').text()) + parseFloat($('#total_gluing_parts').text()) + parseFloat($('#total_phallus_welding').text()) ).toFixed(2))
}