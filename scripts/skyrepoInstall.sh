#!/bin/bash

# To install SkyRepo:
# 1. wget https://raw.githubusercontent.com/eduworks/skyrepo/master/scripts/skyrepoInstall.sh
# 2. chmod +x skyrepoInstall.sh
# 3. sudo ./skyrepoInstall.sh
#
# This is best run on a fresh and new machine. If installing on the same machine as other services, it is recommended to run this script piecewise and by hand.

if [ "$EUID" -ne 0 ];
  then echo "Please run as root."
  exit
fi

md5Local=`cat skyrepoInstall.sh | md5sum`
md5Remote=`curl -s https://raw.githubusercontent.com/eduworks/skyrepo/master/scripts/skyrepoInstall.sh | md5sum`
if [ "$md5Local" != "$md5Remote" ]
 then
 read -p "Update script has changed. Update from Github? [default=yes]" result
 result=${result:-yes}
 if [ "$result" == "yes" ]
  then
  curl -s https://raw.githubusercontent.com/eduworks/skyrepo/master/scripts/skyrepoInstall.sh > skyrepoInstall.sh
  echo Updated. Please re run.
  exit 0
 fi
fi

echo -----
echo Detecting Platform...

platformFedora=`cat /etc/*release | grep fedora | wc -l`
platformDebian=`cat /etc/*release | grep debian | wc -l`
if [ "$platformDebian" -ne 0 ];
 then
 echo Debian based platform found...
fi
if [ "$platformFedora" -ne 0 ];
 then
 echo Fedora based platform found...
fi
if [ "$platformDebian" -ne 0 ] && [ "$platformFedora" -ne 0 ];
 then
 echo No compatible platform found. Exiting.
 exit 1
fi

echo -----
echo Updating Repositories...

if [ "$platformDebian" -ne 0 ];
 then
apt-get -qqy update
fi
if [ "$platformFedora" -ne 0 ];
 then
yum -y -q update
fi

if [ "$platformDebian" -ne 0 ] && [ ! -e "/usr/lib/jvm/java-8-oracle" ];
 then
echo -----
echo Installing Oracle Java...
add-apt-repository ppa:webupd8team/java
apt-get -qqy update
apt-get -qqy remove tomcat7 maven
apt-get -qqy autoremove
apt-get -qqy install oracle-java8-installer
echo "JAVA_HOME=/usr/lib/jvm/java-8-oracle" >> /etc/default/tomcat7
fi
if [ "$platformFedora" -ne 0 ] && [ ! -e "/usr/java/jdk1.8.0_144/jre/bin/java" ];
 then
echo -----
echo Installing Oracle Java...
yum -y -q remove tomcat maven
echo If installing Java does not work, please download and install Oracle Java 8.
wget --no-cookies --no-check-certificate --header "Cookie: gpw_e24=http%3A%2F%2Fwww.oracle.com%2F; oraclelicense=accept-securebackup-cookie" "http://download.oracle.com/otn-pub/java/jdk/8u144-b01/090f390dda5b47b9b721c7dfaa008135/jdk-8u144-linux-x64.rpm"
yum -y -q mastlocalinstall jdk-8u144-linux-x64.rpm
echo Please ensure Oracle Java is installed.
pause
alternatives --config java
rm jdk-8u144-linux-x64.rpm
fi

if [ "$platformDebian" -ne 0 ] && [ ! -e "/usr/bin/git" ];
 then
echo -----
echo Installing git...
apt-get -qqy install git
fi
if [ "$platformFedora" -ne 0 ] && [ ! -e "/usr/bin/git" ];
 then
echo -----
echo Installing git...
yum install -y -q git
fi

if [ "$platformDebian" -ne 0 ] && [ ! -e "/usr/bin/mvn" ];
 then
echo -----
echo Installing Maven...
apt-get -qqy install maven
fi
if [ "$platformFedora" -ne 0 ] && [ ! -e "/usr/bin/mvn" ];
 then
echo -----
echo Installing Maven...
wget http://repos.fedorapeople.org/repos/dchen/apache-maven/epel-apache-maven.repo -O /etc/yum.repos.d/epel-apache-maven.repo
sed -i s/\$releasever/6/g /etc/yum.repos.d/epel-apache-maven.repo
yum install -y -q apache-maven
fi

if [ "$platformDebian" -ne 0 ] && [ ! -e "/etc/init.d/tomcat7" ];
 then
echo -----
echo Installing Tomcat 7...
apt-get -qqy install tomcat7
mkdir /var/lib/tomcat7/backup
chown tomcat7:tomcat7 /var/lib/tomcat7/backup
chown tomcat7:tomcat7 /var/lib/tomcat7
fi
if [ "$platformFedora" -ne 0 ] && [ ! -e "/etc/init.d/tomcat7" ];
 then
echo -----
echo Installing Tomcat...
yum -y -q install tomcat
mkdir /usr/share/tomcat/backup
chown tomcat:tomcat /usr/share/tomcat/backup
chown tomcat:tomcat /var/lib/tomcat
fi

sleep 3s
service tomcat7 stop
sleep 3s

echo -----
echo Removing Old Versions of SkyRepo...

if [ "$platformDebian" -ne 0 ]
 then
rm -rf /var/lib/tomcat7/webapps/skyrepo*
fi
if [ "$platformFedora" -ne 0 ]
 then
rm -rf /usr/share/tomcat/webapps/skyrepo*
fi

if [ "$platformDebian" -ne 0 ] && [ ! -e "/etc/init.d/elasticsearch" ]
 then
echo -----
echo Downloading and installing ElasticSearch 5.x...
wget -qO - https://artifacts.elastic.co/GPG-KEY-elasticsearch | sudo apt-key add -
apt-get -qqy install apt-transport-https
echo "deb https://artifacts.elastic.co/packages/5.x/apt stable main" | tee -a /etc/apt/sources.list.d/elastic-5.x.list
apt-get -qqy update
apt-get -qqy install elasticsearch
update-rc.d elasticsearch defaults 95 10
systemctl enable elasticsearch.service
fi
if [ "$platformFedora" -ne 0 ] && [ ! -e "/etc/init.d/elasticsearch" ]
 then
echo -----
echo Downloading and installing ElasticSearch 5.x...
rpm --import https://artifacts.elastic.co/GPG-KEY-elasticsearch
echo "[elasticsearch-5.x]" >> /etc/yum.repos.d/elasticsearch.repo
echo "name=Elasticsearch repository for 5.x packages" >> /etc/yum.repos.d/elasticsearch.repo
echo "baseurl=https://artifacts.elastic.co/packages/5.x/yum" >> /etc/yum.repos.d/elasticsearch.repo
echo "gpgcheck=1" >> /etc/yum.repos.d/elasticsearch.repo
echo "gpgkey=https://artifacts.elastic.co/GPG-KEY-elasticsearch" >> /etc/yum.repos.d/elasticsearch.repo
echo "enabled=1" >> /etc/yum.repos.d/elasticsearch.repo
echo "autorefresh=1" >> /etc/yum.repos.d/elasticsearch.repo
echo "type=rpm-md" >> /etc/yum.repos.d/elasticsearch.repo
yum install elasticsearch
chkconfig --add elasticsearch
chkconfig elasticsearch on
fi

#Upgrade script
if [ "$platformDebian" -ne 0 ] && [ -e "/usr/share/elasticsearch/lib/elasticsearch-2.2.1.jar" ]
 then
echo -----
echo Upgrading ElasticSearch 2.2 to 5.x...
wget -qO - https://artifacts.elastic.co/GPG-KEY-elasticsearch | sudo apt-key add -
apt-get -qqy install apt-transport-https
echo "deb https://artifacts.elastic.co/packages/5.x/apt stable main" | tee -a /etc/apt/sources.list.d/elastic-5.x.list
apt-get -qqy update
apt-get -qqy install elasticsearch
update-rc.d elasticsearch defaults 95 10
fi
if [ "$platformFedora" -ne 0 ] && [ -e "/usr/share/elasticsearch/lib/elasticsearch-2.2.1.jar" ]
 then
echo -----
echo Upgrading ElasticSearch 2.2 to 5.x...
rpm --import https://artifacts.elastic.co/GPG-KEY-elasticsearch
echo "[elasticsearch-5.x]" >> /etc/yum.repos.d/elasticsearch.repo
echo "name=Elasticsearch repository for 5.x packages" >> /etc/yum.repos.d/elasticsearch.repo
echo "baseurl=https://artifacts.elastic.co/packages/5.x/yum" >> /etc/yum.repos.d/elasticsearch.repo
echo "gpgcheck=1" >> /etc/yum.repos.d/elasticsearch.repo
echo "gpgkey=https://artifacts.elastic.co/GPG-KEY-elasticsearch" >> /etc/yum.repos.d/elasticsearch.repo
echo "enabled=1" >> /etc/yum.repos.d/elasticsearch.repo
echo "autorefresh=1" >> /etc/yum.repos.d/elasticsearch.repo
echo "type=rpm-md" >> /etc/yum.repos.d/elasticsearch.repo
yum install elasticsearch
chkconfig --add elasticsearch
chkconfig elasticsearch on
fi

if [ "$platformDebian" -ne 0 ] && [ ! -e "/etc/init.d/apache2" ];
 then
echo -----
echo Installing Apache 2...
apt-get -qqy install apache2
fi
if [ "$platformFedora" -ne 0 ] && [ ! -e "/etc/init.d/httpd" ];
 then
echo -----
echo Installing HTTPD...
yum -q -y install httpd
fi

if [ -z "$1" ];
 then
echo -----
echo Available Recommended Versions:

git ls-remote http://github.com/eduworks/skyrepo | grep \\. | grep -v - | sed 's/refs\/heads\///g' | awk '{print $2}' | sort

echo
echo Experimental Version: master

read -p "Version to install: " -i "master" branch
 else
branch=$1
fi

echo -----
echo Downloading SkyRepo...
git clone https://github.com/eduworks/skyrepo -b $branch
cd skyrepo
echo Compiling SkyRepo...
mvn -q clean install
echo Deploying SkyRepo...
if [ "$platformDebian" -ne 0 ];
 then
 cp target/skyrepo.war /var/lib/tomcat7/webapps
fi
if [ "$platformFedora" -ne 0 ];
 then
 cp target/skyrepo.war /usr/share/tomcat/webapps
fi
cd ..
rm -rf skyrepo

if [ "$platformDebian" -ne 0 ];
 then
 echo -----
 echo Configuring Apache
 num=`grep ProxyPass /etc/apache2/sites-enabled/000-default.conf | wc -l`
 if [ "$num" -eq 0 ]
  then
  echo -----
  echo Configuring Apache...

  echo "ProxyRequests Off" >> /etc/apache2/sites-enabled/000-default.conf
  echo "ProxyPass / http://localhost:8080/skyrepo/" >> /etc/apache2/sites-enabled/000-default.conf
  echo "ProxyPassReverse  /  http://localhost:8080/skyrepo/" >> /etc/apache2/sites-enabled/000-default.conf
 fi
 num=`grep ws /etc/apache2/sites-enabled/000-default.conf | wc -l`
 if [ "$num" -eq 0 ]
  then
  echo -----
  echo Configuring Apache...
  awk -i inplace -v rmv="ProxyRequests Off" '!index($0,rmv)' /etc/apache2/sites-enabled/000-default.conf
  awk -i inplace -v rmv="ProxyPass / http://localhost:8080/skyrepo/" '!index($0,rmv)' /etc/apache2/sites-enabled/000-default.conf
  awk -i inplace -v rmv="ProxyPassReverse  /  http://localhost:8080/skyrepo/" '!index($0,rmv)' /etc/apache2/sites-enabled/000-default.conf
  echo "ProxyRequests Off" >> /etc/apache2/sites-enabled/000-default.conf
  echo "ProxyPass /ws ws://localhost:8080/skyrepo/ws" >> /etc/apache2/sites-enabled/000-default.conf
  echo "ProxyPassReverse  /ws  ws://localhost:8080/skyrepo/ws" >> /etc/apache2/sites-enabled/000-default.conf
  echo "ProxyPass / http://localhost:8080/skyrepo/" >> /etc/apache2/sites-enabled/000-default.conf
  echo "ProxyPassReverse  /  http://localhost:8080/skyrepo/" >> /etc/apache2/sites-enabled/000-default.conf
 fi
 a2enmod proxy_http ssl proxy_wstunnel
fi

if [ "$platformFedora" -ne 0 ];
 then
	num=`grep ProxyPass /etc/httpd/conf/httpd.conf | wc -l`
	if [ "$num" -eq 0 ]
	 then

	echo -----
	echo Configuring HTTPD...

	echo "ProxyRequests Off" >> /etc/httpd/conf/httpd.conf
	echo "ProxyPass / http://localhost:8080/skyrepo/" >> /etc/httpd/conf/httpd.conf
	echo "ProxyPassReverse  /  http://localhost:8080/skyrepo/" >> /etc/httpd/conf/httpd.conf

	fi
	num=`grep ws /etc/httpd/conf/httpd.conf | wc -l`
	if [ "$num" -eq 0 ]
	 then

	echo -----
	echo Configuring HTTPD...

    awk -i inplace -v rmv="ProxyRequests Off" '!index($0,rmv)' /etc/httpd/conf/httpd.conf
    awk -i inplace -v rmv="ProxyPass / http://localhost:8080/skyrepo/" '!index($0,rmv)' /etc/httpd/conf/httpd.conf
    awk -i inplace -v rmv="ProxyPassReverse  /  http://localhost:8080/skyrepo/" '!index($0,rmv)' /etc/httpd/conf/httpd.conf
	echo "ProxyRequests Off" >> /etc/httpd/conf/httpd.conf
	echo "ProxyPass /ws ws://localhost:8080/skyrepo/ws" >> /etc/httpd/conf/httpd.conf
	echo "ProxyPassReverse  /ws  ws://localhost:8080/skyrepo/ws" >> /etc/httpd/conf/httpd.conf
	echo "ProxyPass / http://localhost:8080/skyrepo/" >> /etc/httpd/conf/httpd.conf
	echo "ProxyPassReverse  /  http://localhost:8080/skyrepo/" >> /etc/httpd/conf/httpd.conf

	fi
fi

if [ "$platformDebian" -ne 0 ];
 then
echo -----
echo Synchronizing Time with NIST...
apt-get -qqy install ntpdate
ntpdate -s time.nist.gov
fi

if [ "$platformFedora" -ne 0 ];
 then
echo -----
echo Synchronizing Time with NIST...
yum -q -y install ntpdate
ntpdate -s time.nist.gov
fi

echo -----
echo Starting Tomcat...
if [ "$platformDebian" -ne 0 ];
 then
 service tomcat7 start
fi
if [ "$platformFedora" -ne 0 ];
 then
 service tomcat start
fi

echo -----
echo Starting ElasticSearch...
service elasticsearch stop
service elasticsearch start

if [ "$platformDebian" -ne 0 ];
 then
echo -----
echo Starting Apache...
service apache2 stop
service apache2 start
fi

if [ "$platformFedora" -ne 0 ];
 then
echo -----
echo Starting HTTPD...
service httpd stop
service httpd start
fi

echo -----
echo -----
echo Navigate to this server to see SkyRepo.
echo
echo We highly recommend the following next steps:
echo  -Mapping DNS to this machine.
echo  -Installing and configuring SSL.
