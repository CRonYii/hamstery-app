import { Cascader } from 'antd';
import React, { useEffect, useState } from 'react';
import { useAppSelector } from '../../app/hooks';
import { selectStatus } from '../GlobalSlice';
import { hamsteryList } from '../HamsteryAPI';

const listToPathOptions = (list: any) => list.path.map((p: any) => {
    return {
        value: p.key,
        label: p.title,
        isLeaf: false
    }
})

const listToFileOptions = (list: any) => list.file.map((p: any) => {
    return {
        value: p.key,
        label: p.title,
        isLeaf: true
    }
})

const listToAllOptions = (list: any) => [...listToPathOptions(list), ...listToFileOptions(list)];

const listToOptions = (type: 'path' | 'file', list: any) => {
    switch (type) {
        case 'file': return listToAllOptions(list)
        case 'path': return listToPathOptions(list)
    }
}

export function PathSelector(props: any) {
    const { type = 'path', onChange } = props;
    const { appSecret } = useAppSelector(selectStatus);
    const [options, setOptions] = useState([]);
    useEffect(() => {
        hamsteryList(appSecret)
            .then((list) => {
                setOptions(listToOptions('path', list));
            });
    }, [appSecret]);

    const onCascaderChange = (value: any, selectedOptions: any) => {
        const targetOption = selectedOptions[selectedOptions.length - 1];
        if (onChange)
            onChange(targetOption.value);
    }

    const loadData = async (selectedOptions: any) => {
        const targetOption = selectedOptions[selectedOptions.length - 1];
        targetOption.loading = true;

        const path = await hamsteryList(appSecret, targetOption.value);
        targetOption.loading = false;
        targetOption.children = listToOptions(type, path);

        setOptions([...options]);
    }

    return <Cascader
        placeholder='Select'
        changeOnSelect={type === 'path'}
        style={{ minWidth: 200, width: '100%' }}
        displayRender={(label) => label[label.length - 1]}
        onChange={onCascaderChange} loadData={loadData}
        options={options}
    />
}