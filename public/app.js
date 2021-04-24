'use strict';

$('li').on('click', function(){
    $(this).toggleClass('crossing');
});

$('#updateForm').hide();

$('#updateBtn').on('click', function(){
    $('#updateForm').toggle();
});
