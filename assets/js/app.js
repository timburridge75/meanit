(function(config, db){

    var getNeeds = function(){
        var needs = [];
        $('input:checkbox.need-field').each(function () {
            needs.push(this.checked);
        });

        return needs;
    };

    var isValid = function(){

        var valid = true;
        $('#alias-field, #contact-field, #language-field, #location-field').each(function(){
            valid = valid && $(this).val().length > 0;
        });

        var needs = getNeeds();
        valid = valid && needs.reduce(function(a, b){ return a + b; }, 0) > 0;

        return valid;
    };

    var showTip = function () {
        $('#result_error').show();
    };

    var getFieldValues = function () {
        return {
            alias: $('#alias-field').val(),
            contact: $('#contact-field').val(),
            location: $('#location-field').val(),
            language: $('#language-field').val(),
            needs: getNeeds(),
            publish_time: (new Date()).getTime()
        };
    };

    var cleanFields = function () {
        $('#alias-field').val('');
        $('#contact-field').val('');
        $('#location-field').val('');
        $('#language-field').val('');

        $('input:checkbox.need-field').each(function () {
            this.checked = false;
        });
    };

    var getUserData = function(){
        $('#result_error, #result_ok').hide();
        if(!isValid()) {
            showTip();
            return false;
        }

        $('#result_ok').show();

        var userRequestValues = getFieldValues();

        cleanFields();

        return userRequestValues;
    };

    var formatNeeds = function(needs){

        var needContent = '';
        $(needs).each(function(idx, val){

            if(val){
                needContent += '<li class="needs-item">' + config.needList[idx] + '</li>';
            }
        });

        return '<ul>' + needContent
            + '</ul>' ;
    }

    var buildNeedNode = function (need) {
        return '<li>' +
                    '<span class="needs-preview-column column-20">' + need.location + '</span>' +
                    '<span class="needs-preview-column column-20">' + need.language + '</span>' +
                    '<span class="needs-preview-column column-60">' + formatNeeds(need.needs) + '</span>' +
                '</li>';
    };

    $('#publish').click(function () {
        db.writeToList(config.collections.needs, getUserData());
    });

    $('#result_error, #result_ok').hide();

    db.read(config.collections.needs)
        .orderByChild('publish_time')
        .limitToLast(config.setup.needs_preview)
        .on("value", function (snapshot) {

            if(snapshot.val() == null) return;

            var needs = Object.values(snapshot.val()).reverse();
            var needsPreviewContainer = $('#needs-preview');
            needs.forEach((need) => {
                needsPreviewContainer.append(buildNeedNode(need));
            });
    });

})(config, db);