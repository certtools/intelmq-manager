function get_versions() {
    var intelmq_version_element = document.getElementById('intelmq-version');
    var intelmq_manager_version_element = document.getElementById('intelmq-manager-version');
    
    $.getJSON(MANAGEMENT_SCRIPT + '?scope=version')
        .done(function (data) {
            intelmq_version_element.innerHTML = data['intelmq'];
            intelmq_manager_version_element.innerHTML = data['intelmq-manager'];
        })
        .fail(function (jqxhr, textStatus, error) {
            var err = textStatus + ", " + error;
            console.error( "Request Failed: " + err );
            alert('error getting version');
        });
}

get_versions();
