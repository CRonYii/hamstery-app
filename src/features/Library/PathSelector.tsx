import { Cascader } from 'antd';
import React, { useEffect, useState } from 'react';
import { useAppSelector } from '../../app/hooks';
import { selectStatus } from '../GlobalSlice';
import { hamsteryList } from '../HamsteryAPI';

const listToOptions = (list: any) => list.path.map((p: any) => {
    return {
        value: p.key,
        label: p.title,
        isLeaf: false
    }
})

export function PathSelector(props: any) {
    const { onChange } = props;
    const { appSecret } = useAppSelector(selectStatus);
    const [options, setOptions] = useState([]);
    useEffect(() => {
        hamsteryList(appSecret)
            .then((list) => {
                setOptions(listToOptions(list));
            });
    }, [appSecret]);
    console.log(options);

    const onCascaderChange = (value: any, selectedOptions: any) => {
        const targetOption = selectedOptions[selectedOptions.length - 1];
        onChange(targetOption.value);
    }

    const loadData = async (selectedOptions: any) => {
        const targetOption = selectedOptions[selectedOptions.length - 1];
        targetOption.loading = true;

        const path = await hamsteryList(appSecret, targetOption.value);
        targetOption.loading = false;
        targetOption.children = listToOptions(path);
        targetOption.isLeaf = targetOption.children.length === 0;

        setOptions([...options]);
    }

    return <Cascader
        changeOnSelect
        style={{ minWidth: 200 }}
        displayRender={(label) => label[label.length - 1]}
        onChange={onCascaderChange} loadData={loadData}
        options={options}
    />
}