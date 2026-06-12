from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('audits', '0005_audit_competitors_competitor_notes'),
    ]

    operations = [
        migrations.AlterField(
            model_name='auditimage',
            name='image',
            field=models.ImageField(blank=True, upload_to='audit_images/'),
        ),
        migrations.AddField(
            model_name='auditimage',
            name='image_url',
            field=models.URLField(blank=True, max_length=500),
        ),
    ]
