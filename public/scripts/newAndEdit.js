/*global $*/

$(".type input[type='radio']").click(function(){
    $(".type input[type=radio]").parent().attr("class", "btn btn-outline-secondary")
    $(".otherTextBox").hide();
    $(".otherTextBox").prop("disabled", true);
    if($(this).is(":checked")){
        $(this).parent().attr("class", "btn btn-outline-success")
    };
});

$(".fact-myth input[type='radio']").click(function(){
    $(".fact-myth input[type=radio]").parent().attr("class", "btn btn-outline-secondary")
    if($(this).is(":checked")){
        $(this).parent().attr("class", "btn btn-outline-success")
    };
});

$("label[for='other']").click(function(){
    $(".otherTextBox").show();
    $(".type :checked").prop("checked", false)
    $(".otherTextBox").prop("disabled", false)
})
