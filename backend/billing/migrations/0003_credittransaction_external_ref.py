from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('billing', '0002_polarwebhookevent'),
    ]

    operations = [
        migrations.AddField(
            model_name='credittransaction',
            name='external_ref',
            field=models.CharField(blank=True, db_index=True, default='', max_length=255),
        ),
    ]
