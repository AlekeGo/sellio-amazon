from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('billing', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='PolarWebhookEvent',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('event_id', models.CharField(max_length=255, unique=True)),
                ('event_type', models.CharField(max_length=100)),
                ('processed_at', models.DateTimeField(blank=True, null=True)),
                ('raw_payload', models.JSONField()),
                ('status', models.CharField(
                    choices=[
                        ('pending', 'Pending'),
                        ('processed', 'Processed'),
                        ('failed', 'Failed'),
                        ('skipped', 'Skipped'),
                    ],
                    default='pending',
                    max_length=20,
                )),
                ('error_message', models.TextField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
        ),
    ]
