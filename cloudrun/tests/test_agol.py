from download import agol


def test_create_relationship_skips_query_without_new_primary_keys(mocker):
    get_agol_data = mocker.patch("download.agol.get_agol_data")
    config = {
        "name": "parent_to_related",
        "tableName": "related",
        "url": "https://example.com/FeatureServer/0",
        "primary": "parent_id",
        "foreign": "parent_id",
    }

    agol.create_relationship(
        config,
        [1, 2],
        [{"name": "parent_id", "type": "esriFieldTypeInteger"}],
        False,
        "parent",
        "csv",
        {"related": {1, 2}},
    )

    get_agol_data.assert_not_called()