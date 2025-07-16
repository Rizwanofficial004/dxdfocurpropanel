# Quick Server Setup Guide for DDS Focus Time API

## 🚀 Deployment Options

### 1. **DigitalOcean Droplet (Recommended for beginners)**
```bash
# Create a $10/month droplet with Ubuntu 22.04
# SSH into your server and run:
git clone https://github.com/yourusername/ddsfocustime.git
cd ddsfocustime
chmod +x deploy.sh
./deploy.sh
```

### 2. **AWS EC2 Instance**
```bash
# Launch t3.small instance with Ubuntu 22.04
# Configure security groups: HTTP (80), HTTPS (443), SSH (22)
# SSH in and run the deployment script
```

### 3. **Heroku (Easy but more expensive)**
```bash
# Install Heroku CLI
heroku create ddsfocustime-api
heroku config:set DEBUG=False
heroku config:set SECRET_KEY=your-secret-key
heroku config:set DATABASE_URL=postgres://...
git push heroku main
```

### 4. **Docker Deployment (Any server)**
```bash
# Build and run with Docker
docker-compose up -d
```

## 📋 Pre-Deployment Steps

### 1. Update Settings
Edit `.env.production` with your values:
- `SECRET_KEY`: Generate a new secret key
- `ALLOWED_HOSTS`: Your domain name and IP
- `DATABASE_URL`: Your database connection
- `AWS_*`: Your AWS credentials

### 2. Domain Setup
- Point your domain to your server IP
- Configure DNS A records
- Set up SSL certificate with Let's Encrypt

### 3. Database Setup
- Create PostgreSQL database
- Run migrations: `python manage.py migrate`
- Create superuser: `python manage.py createsuperuser`

## 🔧 Server Requirements

### Minimum Requirements:
- **CPU**: 1 vCPU
- **RAM**: 1GB (2GB recommended)
- **Storage**: 25GB SSD
- **OS**: Ubuntu 20.04+ or CentOS 8+

### Recommended for Production:
- **CPU**: 2 vCPUs
- **RAM**: 4GB
- **Storage**: 50GB SSD
- **Load Balancer**: For high availability

## 🔐 Security Checklist

- [ ] Change default passwords
- [ ] Configure firewall (UFW)
- [ ] Set up SSL certificate
- [ ] Regular security updates
- [ ] Monitor logs and errors
- [ ] Backup database regularly
- [ ] Use environment variables for secrets

## 📊 Monitoring Setup

### 1. Application Monitoring
```bash
# Install and configure:
# - Sentry for error tracking
# - New Relic for performance
# - DataDog for infrastructure
```

### 2. Server Monitoring
```bash
# Basic monitoring
sudo apt install htop iotop
# Advanced: Prometheus + Grafana
```

## 🚀 Quick Deploy Commands

### DigitalOcean One-Click:
```bash
curl -sSL https://raw.githubusercontent.com/yourusername/ddsfocustime/main/deploy.sh | bash
```

### Manual Ubuntu Setup:
```bash
# 1. Clone repository
git clone https://your-repo-url.git
cd ddsfocustime

# 2. Run deployment script
chmod +x deploy.sh
./deploy.sh

# 3. Configure environment
cp .env.production .env
nano .env  # Edit with your values

# 4. Start services
sudo systemctl start ddsfocustime
sudo systemctl start nginx

# 5. Set up SSL
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx
```

## 🌐 API Endpoints After Deployment

Your API will be available at:
- `https://yourdomain.com/api/test/` - Test endpoint
- `https://yourdomain.com/api/auth/login/` - Login
- `https://yourdomain.com/api/screenshots/` - Screenshots
- `https://yourdomain.com/api/logs/` - Logs
- `https://yourdomain.com/admin/` - Django admin

## 💡 Performance Tips

1. **Use Redis for caching**
2. **Configure CDN for static files**
3. **Enable Gzip compression**
4. **Use PostgreSQL for production**
5. **Set up database connection pooling**
6. **Monitor and optimize slow queries**

## 🔄 Deployment Workflow

```bash
# Development to Production Pipeline
1. Test locally
2. Push to GitHub
3. Pull on server
4. Run migrations if needed
5. Collect static files
6. Restart services
7. Verify deployment
```

## 📞 Support

If you need help with deployment:
1. Check the logs: `sudo journalctl -u ddsfocustime -f`
2. Verify nginx config: `sudo nginx -t`
3. Check database connection
4. Review environment variables
