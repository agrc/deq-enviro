from download import agol


def test_create_relationship_batches_primary_keys(mocker):
    get_agol_data = mocker.patch("download.agol.get_agol_data")
    primary_keys = list(range(agol.max_in_values + 1))
    config = {
        "name": "parent_to_related",
        "tableName": "related",
        "url": "https://example.com/FeatureServer/0",
        "primary": "parent_id",
        "foreign": "parent_id",
    }

    agol.create_relationship(
        config,
        primary_keys,
        [{"name": "parent_id", "type": "esriFieldTypeInteger"}],
        False,
        "parent",
        "csv",
        {},
    )

    assert get_agol_data.call_count == 2
    assert all(
        call.kwargs["where"].count(",") < agol.max_in_values
        for call in get_agol_data.call_args_list
    )


def test_create_relationship_adds_filegdb_relationship_once(mocker, monkeypatch):
    get_agol_data = mocker.patch("download.agol.get_agol_data")
    mocker.patch("download.agol.write_to_output")
    relationship = mocker.patch("download.agol.gdal.Relationship")
    output_dataset = mocker.Mock()
    mocker.patch("download.agol.gdal.OpenEx", return_value=output_dataset)
    feature_set = mocker.Mock()
    feature_set.features = [mocker.Mock()]
    get_agol_data.side_effect = [feature_set, feature_set]
    monkeypatch.setattr(agol, "max_in_values", 1)
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
        "filegdb",
        {},
    )

    relationship.assert_called_once()
    output_dataset.AddRelationship.assert_called_once()


def test_create_relationship_batches_nested_relationship_keys(mocker):
    get_agol_data = mocker.patch("download.agol.get_agol_data")
    mocker.patch("download.agol.write_to_output")
    parent_keys = list(range(agol.max_in_values + 1))
    nested_keys = list(range(1, agol.max_in_values + 1))

    def related_feature_set(primary_keys):
        feature_set = mocker.Mock()
        feature_set.features = [mocker.Mock()]
        primary_key_column = mocker.Mock()
        primary_key_column.tolist.return_value = primary_keys
        feature_set.sdf.reset_index.return_value = {"child_id": primary_key_column}
        feature_set.fields = [{"name": "child_id", "type": "esriFieldTypeInteger"}]
        return feature_set

    empty_feature_set = mocker.Mock()
    empty_feature_set.features = []
    get_agol_data.side_effect = [
        related_feature_set(nested_keys[: agol.max_in_values // 2]),
        related_feature_set(nested_keys[agol.max_in_values // 2 :]),
        empty_feature_set,
    ]
    config = {
        "name": "parent_to_related",
        "tableName": "related",
        "url": "https://example.com/FeatureServer/0",
        "primary": "parent_id",
        "foreign": "parent_id",
        "nestedRelationships": [
            {
                "name": "related_to_child",
                "tableName": "child",
                "url": "https://example.com/FeatureServer/1",
                "primary": "child_id",
                "foreign": "child_id",
            }
        ],
    }

    agol.create_relationship(
        config,
        parent_keys,
        [{"name": "parent_id", "type": "esriFieldTypeInteger"}],
        False,
        "parent",
        "csv",
        {},
    )

    assert get_agol_data.call_count == 3
    nested_where = get_agol_data.call_args_list[2].kwargs["where"]
    assert nested_where.startswith("child_id IN ")
    assert {int(value) for value in nested_where[13:-1].split(",")} == set(nested_keys)


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
