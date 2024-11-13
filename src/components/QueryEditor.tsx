import React, { ChangeEvent } from 'react';
import { InlineField, Input } from '@grafana/ui';
import { QueryEditorProps } from '@grafana/data';
import { DataSource } from '../datasource';
import { MyDataSourceOptions, MyQuery } from '../types';

type Props = QueryEditorProps<DataSource, MyQuery, MyDataSourceOptions>;

export function QueryEditor({ query, onChange, onRunQuery }: Props) {
  // const onQueryTextChange = (event: ChangeEvent<HTMLInputElement>) => {
  //   onChange({ ...query, queryText: event.target.value });
  // };

  const onTargetChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange({ ...query, target: event.target.value });
    // executes the query
    onRunQuery();
  };

  // const { queryText, constant } = query;

  return (
    <div className="gf-form">
      <InlineField label="TARGET" labelWidth={8}>
        <Input
          value={query.target || ''}
          onChange={onTargetChange}
          onBlur={onRunQuery}
          placeholder="データ種の設定"
          width={30}
        />
      </InlineField>
    </div>
    // <Stack gap={0}>
    //   <InlineField label="Constant">
    //     <Input
    //       id="query-editor-constant"
    //       onChange={onConstantChange}
    //       value={constant}
    //       width={8}
    //       type="number"
    //       step="0.1"
    //     />
    //   </InlineField>
    //   <InlineField label="Query Text" labelWidth={16} tooltip="Not used yet">
    //     <Input
    //       id="query-editor-query-text"
    //       onChange={onQueryTextChange}
    //       value={queryText || ''}
    //       required
    //       placeholder="Enter a query"
    //     />
    //   </InlineField>
    // </Stack>
  );
}
