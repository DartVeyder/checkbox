$(document).ready(function () {
    rroOrderInfo()

    refreshStatusCashRegister();
    orderRefreshStatusShift()
    createShift()
    closeShift()

    orderCreateReceiptPayment();
    orderReturnReceiptPayment()

    confirmReceipt()

    function refreshStatusCashRegister() {
        $('.checkbox-rro-order-list-button-refresh').off().click(function () {
            preloader('on');
            $.ajax({
                type: "GET",
                dataType: "json",
                data: {
                    action: "refreshStatusCashRegister"
                },
                url: "class/controllerAjaxCheckbox.php",
                async: false,
                success: function (data) {
                    console.log(data);
                    preloader('off');
                    htmlControlPanel(data)
                    createShift()
                    closeShift()
                }
            });
        })
    }

    function closeShift() {
        $('.close-shift').click(function () {
            $.ajax({
                type: "GET",
                dataType: "json",
                data: {
                    action: "close_shift"
                },
                url: "class/controllerAjaxCheckbox.php",
                async: false,
                success: function (data) {
                    console.log(data);
                    htmlControlPanel(data)
                    createShift()
                    window.open('class/controllerAjaxCheckbox.php?action=zReport&z_report_id='+data['z_report_id'], '_blank');
                }
            });
        })
    }

    function createShift() {
        $('.create-shift').click(function () {
            $.ajax({
                type: "GET",
                dataType: "json",
                data: {
                    action: "create_shift"
                },
                url: "class/controllerAjaxCheckbox.php",
                async: false,
                success: function (data) {
                    console.log(data);
                    htmlControlPanel(data)
                    closeShift()
                }
            });
        })
    }

    function htmlControlPanel(data) {
        if (data['status'] == 'OPENED') {
            $('.checkbox-rro-order-status').html('<span style="color: green">' + data['status'] + '</span><br><span>' + data['date_at'] + '</span>')
            $('#item-shift').html(' <button class="btn btn-danger close-shift"><i class="fa fa-ban fa-fw"></i>Закрити зміну</button>')
        } else {
            $('.checkbox-rro-order-status').html('<span style="color: red">' + data['status'] + '</span><br><span></span>')
            $('#item-shift').html(' <button class="btn btn-success create-shift"><i class="fa fa-check fa-fw"></i>Відкрити зміну</button>')
        }
    }

    function preloader(action) {
        if (action) {
            $("#preloader").show()
        } else {
            $("#preloader").hide()
        }
    }

    function orderRefreshStatusShift() {
        $('#checkbox-rro-order-info-button-refresh').off().click(function () {
            rroOrderInfo();
        })
    }

    function  htmlControlPanelOrder(data){
        $('.shift-status').show();
        if (data['status'] == 'OPENED') {
            $('.checkbox-rro-order-status').html('<span style="color: green">' + data['status'] + '</span><br><span>' + data['cashier_full_name'] + '</span><br><span>'+data['date_at']+'</span>') 
            $('#item-shift').html(' <button class="btn btn-danger close-shift"><i class="fa fa-ban fa-fw"></i>Закрити зміну</button>')
        } else {
            $('.checkbox-rro-order-status').html('<span style="color: red">' + data['status'] + '</span><br><span>' + data['cashier_full_name'] + '</span><br><span></span>') 
            $('#item-shift').html(' <button class="btn btn-success create-shift"><i class="fa fa-check fa-fw"></i>Відкрити зміну</button>')
        }

        if(!data['order']['return_receipt']['status']){
            $('.order-generate-return-receipt').show()
            $('.order-return-receipt').hide()
        }else{
            $('.order-return-receipt').show()
            $('.order-generate-return-receipt').hide()
            $('.order-return-receipt-message').html(data['order']['return_receipt']['message'])
            $('.return-receipt-link').attr('href', 'class/controllerAjaxCheckbox.php?action=getReceiptHtml&checkbox_receipt_id='+data['order']['return_receipt']['checkbox_return_receipt_id'])
        }

        if(data['order']['receipt']['status']){
            $('.order-generate-receipt').hide();
            $('.order-receipt').show();
            
            $('.order-receipt-send-email').hide() 

            $('.order-message').html(data['order']['receipt']['message'])
            $('.receipt-link').attr('href', 'class/controllerAjaxCheckbox.php?action=getReceiptHtml&checkbox_receipt_id='+data['order']['receipt']['checkbox_receipt_id'])
        }else{
            $('.order-generate-receipt').show();
            $('.order-receipt').hide();
            $('.order-receipt-send-email').show()
            $('.order-generate-return-receipt').hide()
        }

        createShift()
        closeShift()
    }

    function rroOrderInfo(){
        preloader(true)
        var orderId = $('#checkbox-rro-order-info-container').attr('data-order-id');
        $.ajax({
            type: "GET",
            dataType: "json",
            data: {
                order_id : orderId,
                action: "rroOrderInfo"
            },
            url: "class/controllerAjaxCheckbox.php",
            success: function (data) {
                console.log(data);
                htmlControlPanelOrder(data);
                preloader(false)
            },
            error: function (data) {
                console.log(data)
            }
        });
    }
    

    function orderCreateReceiptPayment() {
        
        $('#checkbox-rro-order-info-button-create-receipt').click(function () {
            preloader(true)
            var orderId = $('#checkbox-rro-order-info-container').attr('data-order-id');
            var clientId = $('#checkbox-rro-order-info-container').attr('data-client-id');
            var email = $('#checkbox-rro-order-info-button-create-receipt-send-email').prop('checked')
            $.ajax({
                type: "GET", 
                dataType: "json",
                data: { 
                    order_id: orderId,
                    client_id: clientId,
                    email: email,
                    action: "orderCreateReceiptPayment"
                },
                url: "class/controllerAjaxCheckbox.php", 
                success: function (data) {
                    console.log(data);
                    if(data["status"] != "CLOSED"){
                        rroOrderInfo()  
                    } 
                    
                    preloader(false)
                    alert(data['message'])
                },
                error: function (data) {
                    console.log(data)
                }
            });
        })
    }

    function orderReturnReceiptPayment(){
        $('#checkbox-rro-order-info-button-return-receipt').click(function () {
            preloader(true)
            var orderId = $('#checkbox-rro-order-info-container').attr('data-order-id');
            var clientId = $('#checkbox-rro-order-info-container').attr('data-client-id');
            $.ajax({
                type: "GET", 
                dataType: "json",
                data: { 
                    order_id: orderId,
                    client_id: clientId,
                    is_return: true,
                    action: "orderCreateReceiptPayment"
                },
                url: "class/controllerAjaxCheckbox.php", 
                success: function (data) {
                    console.log(data);
                    if(data["status"] == "CLOSED"){
                        alert(data['message'])
                    }else{
                        rroOrderInfo()
                    }
                    preloader(false)
                },
                error: function (data) {
                    console.log(data)
                }
            });
        })
    }

    function confirmReceipt(){
        $('.pre-create-receipt').click(function(){
            var orderId = $('#checkbox-rro-order-info-container').attr('data-order-id');
            var clientId = $('#checkbox-rro-order-info-container').attr('data-client-id');
            var email = $('#checkbox-rro-order-info-button-create-receipt-send-email').prop('checked')
            console.log(email);
            $.ajax({
                type: "GET",
                dataType: "html",
                data: {
                    order_id: orderId,
                    client_id: clientId,
                    action: "confirmReceipt"
                },
                url: "class/controllerAjaxCheckbox.php",
                success: function (data) {
                    $('.order-list-goods').html(data)
                    
                },
                error: function (data) {
                    console.log(data)
                }
            });
        })
    }
 
})
