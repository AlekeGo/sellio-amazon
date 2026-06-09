from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('audits', '0003_audit_a_plus_content_audit_about_this_item_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='audit',
            name='seller_persona',
            field=models.CharField(
                blank=True,
                choices=[
                    ('premium', 'Premium'),
                    ('budget_friendly', 'Budget Friendly'),
                    ('gift_ready', 'Gift Ready'),
                    ('expert_professional', 'Expert / Professional'),
                    ('luxury', 'Luxury'),
                    ('problem_solver', 'Problem Solver'),
                    ('minimal_clean', 'Minimal / Clean'),
                ],
                max_length=30,
            ),
        ),
        migrations.AddField(
            model_name='auditresult',
            name='pro_upgrade_pack',
            field=models.JSONField(blank=True, null=True),
        ),
    ]
