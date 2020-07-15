function get_versions() {
    var intelmq_version_element = document.getElementById('intelmq-version');
    var intelmq_manager_version_element = document.getElementById('intelmq-manager-version');
    
    authenticatedGetJson(managementUrl('version'))
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
function get_debug() {
    var section_element = document.getElementById('debugging');

    authenticatedGetJson(managementUrl('debug'))
        .done(function (data) {
            for (const section in data) {
                section_heading = document.createElement("h3");
                section_heading.innerHTML = section;
                section_element.appendChild(section_heading);
                table = document.createElement("table");
                tbody = document.createElement("table");

                for (const element of data[section]) {
                    row = tbody.insertRow(-1);
                    cell0 = row.insertCell(0);
                    cell0.innerHTML = "<pre>" + element[0] + "</pre>";
                    cell1 = row.insertCell(1);
                    cell1.innerHTML = "<pre>" + element[1] + "</pre>";
                }
                table.appendChild(tbody);
                section_element.appendChild(table);
            }
            $('#debugging-heading').removeClass('waiting');
        })
        .fail(function (jqxhr, textStatus, error) {
            var err = textStatus + ", " + error;
            console.error( "Request Failed: " + err );
            alert('Error getting debugging information. Do you have IntelMQ >= 2.2.0?');
        });
}

get_versions();
get_debug();
