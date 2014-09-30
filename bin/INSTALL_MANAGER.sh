if [ "$#" -ne 1 ]; then
    echo "Usage: $0 <github_account>"
    exit
fi

echo "Installing dependencies"
apt-get update
apt-get install git apache2 php5 libapache2-mod-php5 apache2-utils

echo "Downloading and copying IntelMQ Manager"
git clone https://$1@github.com/certtools/intelmq-manager.git /tmp/intelmq-manager
cp -R /tmp/intelmq-manager/intelmq-manager/* /var/www/
chown -R www-data.www-data /var/www/

echo "Adding www-data to intelmq group"
usermod -a -G intelmq www-data
echo "www-data ALL=(intelmq) NOPASSWD: /usr/local/bin/intelmqctl" >>/etc/sudoers

#echo "Creating IntelMQ Manager admin account"
#htpasswd -c /etc/apache2/password_file admin
