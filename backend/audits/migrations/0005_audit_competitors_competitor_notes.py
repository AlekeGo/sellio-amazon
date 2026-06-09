from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('audits', '0004_audit_seller_persona_auditresult_pro_upgrade_pack'),
    ]

    operations = [
        migrations.AddField(
            model_name='audit',
            name='competitors',
            field=models.JSONField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='audit',
            name='competitor_notes',
            field=models.TextField(blank=True),
        ),
    ]
