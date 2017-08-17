function get_versions() {
    var intelmq_version_element = document.getElementById('intelmq-version');
    var intelmq_manager_version_element = document.getElementById('intelmq-manager-version');
    
    
    $.getJSON(MANAGEMENT_SCRIPT + '?scope=version')
        .done(function (data) {
            intelmq_version_element.innerHTML = data['intelmq'];
            intelmq_manager_version_element.innerHTML = data['intelmq-manager'];
        });
    
}

get_versions();
