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

    var isContactValid = function(){

        var valid = true;
        $('#contact-name, #contact-email, #contact-message').each(function(){
            valid = valid && $(this).val().length > 0;
        });

        return valid;
    };

    var showTip = function () {
        $('#result_error').show();
    };

    var showContactTip = function () {
        $('#contact_error').show();
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

    var getContactFieldValues = function () {
        return {
            name: $('#contact-name').val(),
            email: $('#contact-email').val(),
            message: $('#contact-message').val()
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

    var cleanContactFields = function () {
        $('#contact-name').val('');
        $('#contact-email').val('');
        $('#contact-message').val('');
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

    var getContactData = function(){
        $('#contact_error, #contact_ok').hide();
        if(!isContactValid()) {
            showContactTip();
            return false;
        }

        $('#contact_ok').show();

        var contactRequestValues = getContactFieldValues();
        cleanContactFields();

        return contactRequestValues;
    };

    var formatNeeds = function(needs){

        var needContent = [];

        $(needs).each(function(idx, val){
            if(val){
                needContent.push(config.needList[idx]);
            }
        });

        return needContent.join(', ');
    }

    var buildNeedNode = function (need) {
        return '<tr class="items">' +
                    '<td class="item-field">' + need.location + '</td>' +
                    '<td class="item-field">' + need.language + '</td>' +
                    '<td class="item-field">' + formatNeeds(need.needs) + '</td>' +
                    '<td class="item-field"><button class="btn btn-primary">Ayudar</button></td>' +
                '</tr>';
    };

    $('#publish').click(function () {
        db.writeToList(config.collections.needs, getUserData());
    });

    $('#send-contact').click(function () {
        db.writeToList(config.collections.contacts, getContactData());
    });

    $('#result_error, #result_ok').hide();
    $('#contact_error, #contact_ok').hide();

    db.read(config.collections.needs)
        .orderByChild('publish_time')
        .limitToLast(config.setup.needs_preview)
        .on("value", function (snapshot) {

            if(snapshot.val() == null) return;

            var needs = Object.values(snapshot.val()).reverse();
            var needsPreviewContainer = $('#needs-preview');
            $('#needs-preview .items').remove();
            needs.forEach((need) => {
                needsPreviewContainer.append(buildNeedNode(need));
            });
    });

    db.read(config.collections.contacts)
        .on("value", function (snapshot) {

            if(snapshot.val() == null) return;

            var contacts = Object.values(snapshot.val());
            console.log('Contacts:');
            contacts.forEach((contact) => {
                console.log(contact);
            });
    });

})(config, db);
