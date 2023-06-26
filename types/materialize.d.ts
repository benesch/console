import type { ColumnType } from "kysely";

export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;

export type Int8 = ColumnType<
  string,
  string | number | bigint,
  string | number | bigint
>;

export type Json = ColumnType<JsonValue, string, string>;

export type JsonArray = JsonValue[];

export type JsonObject = {
  [K in string]?: JsonValue;
};

export type JsonPrimitive = boolean | null | number | string;

export type JsonValue = JsonArray | JsonObject | JsonPrimitive;

export type Numeric = ColumnType<string, string | number, string | number>;

export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export interface MzCatalogMzArrayTypes {
  id: Generated<string>;
  element_id: Generated<string>;
}

export interface MzCatalogMzAuditEvents {
  id: Generated<string>;
  event_type: Generated<string>;
  object_type: Generated<string>;
  details: Generated<Json>;
  user: Generated<string | null>;
  occurred_at: Generated<Timestamp>;
}

export interface MzCatalogMzAwsPrivatelinkConnections {
  id: Generated<string>;
  principal: Generated<string>;
}

export interface MzCatalogMzBaseTypes {
  id: Generated<string>;
}

export interface MzCatalogMzClusterReplicas {
  id: Generated<string>;
  name: Generated<string>;
  cluster_id: Generated<string>;
  size: Generated<string | null>;
  availability_zone: Generated<string | null>;
  owner_id: Generated<string>;
}

export interface MzCatalogMzClusters {
  id: Generated<string>;
  name: Generated<string>;
  owner_id: Generated<string>;
  privileges: Generated<string[]>;
  managed: Generated<boolean>;
  size: Generated<string | null>;
  replication_factor: Generated<string | null>;
}

export interface MzCatalogMzColumns {
  id: Generated<string>;
  name: Generated<string>;
  position: Generated<string>;
  nullable: Generated<boolean>;
  type: Generated<string>;
  default: Generated<string | null>;
  type_oid: Generated<number>;
  type_mod: Generated<number>;
}

export interface MzCatalogMzConnections {
  id: Generated<string>;
  oid: Generated<number>;
  schema_id: Generated<string>;
  name: Generated<string>;
  type: Generated<string>;
  owner_id: Generated<string>;
  privileges: Generated<string[]>;
}

export interface MzCatalogMzDatabases {
  id: Generated<string>;
  oid: Generated<number>;
  name: Generated<string>;
  owner_id: Generated<string>;
  privileges: Generated<string[]>;
}

export interface MzCatalogMzDefaultPrivileges {
  role_id: Generated<string>;
  database_id: Generated<string | null>;
  schema_id: Generated<string | null>;
  object_type: Generated<string>;
  grantee: Generated<string>;
  privileges: Generated<string>;
}

export interface MzCatalogMzEgressIps {
  egress_ip: Generated<string>;
}

export interface MzCatalogMzFunctions {
  id: Generated<string>;
  oid: Generated<number>;
  schema_id: Generated<string>;
  name: Generated<string>;
  argument_type_ids: Generated<string[]>;
  variadic_argument_type_id: Generated<string | null>;
  return_type_id: Generated<string | null>;
  returns_set: Generated<boolean>;
  owner_id: Generated<string>;
}

export interface MzCatalogMzIndexColumns {
  index_id: Generated<string>;
  index_position: Generated<string>;
  on_position: Generated<string | null>;
  on_expression: Generated<string | null>;
  nullable: Generated<boolean>;
}

export interface MzCatalogMzIndexes {
  id: Generated<string>;
  oid: Generated<number>;
  name: Generated<string>;
  on_id: Generated<string>;
  cluster_id: Generated<string>;
  owner_id: Generated<string>;
}

export interface MzCatalogMzKafkaConnections {
  id: Generated<string>;
  brokers: Generated<string[]>;
  sink_progress_topic: Generated<string>;
}

export interface MzCatalogMzKafkaSinks {
  id: Generated<string>;
  topic: Generated<string>;
}

export interface MzCatalogMzListTypes {
  id: Generated<string>;
  element_id: Generated<string>;
}

export interface MzCatalogMzMapTypes {
  id: Generated<string>;
  key_id: Generated<string>;
  value_id: Generated<string>;
}

export interface MzCatalogMzMaterializedViews {
  id: Generated<string>;
  oid: Generated<number>;
  schema_id: Generated<string>;
  name: Generated<string>;
  cluster_id: Generated<string>;
  definition: Generated<string>;
  owner_id: Generated<string>;
  privileges: Generated<string[]>;
}

export interface MzCatalogMzObjects {
  id: string;
  oid: number;
  schema_id: string;
  name: string;
  type: string;
  owner_id: string;
  privileges: string[] | null;
}

export interface MzCatalogMzOperators {
  oid: Generated<number>;
  name: Generated<string>;
  argument_type_ids: Generated<string[]>;
  return_type_id: Generated<string | null>;
}

export interface MzCatalogMzPseudoTypes {
  id: Generated<string>;
}

export interface MzCatalogMzRelations {
  id: string;
  oid: number;
  schema_id: string;
  name: string;
  type: string;
  owner_id: string;
  privileges: string[];
}

export interface MzCatalogMzRoleMembers {
  role_id: Generated<string>;
  member: Generated<string>;
  grantor: Generated<string>;
}

export interface MzCatalogMzRoles {
  id: Generated<string>;
  oid: Generated<number>;
  name: Generated<string>;
  inherit: Generated<boolean>;
  create_role: Generated<boolean>;
  create_db: Generated<boolean>;
  create_cluster: Generated<boolean>;
}

export interface MzCatalogMzSchemas {
  id: Generated<string>;
  oid: Generated<number>;
  database_id: Generated<string | null>;
  name: Generated<string>;
  owner_id: Generated<string>;
  privileges: Generated<string[]>;
}

export interface MzCatalogMzSecrets {
  id: Generated<string>;
  oid: Generated<number>;
  schema_id: Generated<string>;
  name: Generated<string>;
  owner_id: Generated<string>;
  privileges: Generated<string[]>;
}

export interface MzCatalogMzSinks {
  id: Generated<string>;
  oid: Generated<number>;
  schema_id: Generated<string>;
  name: Generated<string>;
  type: Generated<string>;
  connection_id: Generated<string | null>;
  size: Generated<string | null>;
  envelope_type: Generated<string | null>;
  cluster_id: Generated<string>;
  owner_id: Generated<string>;
}

export interface MzCatalogMzSources {
  id: Generated<string>;
  oid: Generated<number>;
  schema_id: Generated<string>;
  name: Generated<string>;
  type: Generated<string>;
  connection_id: Generated<string | null>;
  size: Generated<string | null>;
  envelope_type: Generated<string | null>;
  cluster_id: Generated<string | null>;
  owner_id: Generated<string>;
  privileges: Generated<string[]>;
}

export interface MzCatalogMzSshTunnelConnections {
  id: Generated<string>;
  public_key_1: Generated<string>;
  public_key_2: Generated<string>;
}

export interface MzCatalogMzStorageUsage {
  object_id: string;
  size_bytes: string;
  collection_timestamp: Timestamp;
}

export interface MzCatalogMzTables {
  id: Generated<string>;
  oid: Generated<number>;
  schema_id: Generated<string>;
  name: Generated<string>;
  owner_id: Generated<string>;
  privileges: Generated<string[]>;
}

export interface MzCatalogMzTypes {
  id: Generated<string>;
  oid: Generated<number>;
  schema_id: Generated<string>;
  name: Generated<string>;
  category: Generated<string>;
  owner_id: Generated<string>;
  privileges: Generated<string[]>;
}

export interface MzCatalogMzViews {
  id: Generated<string>;
  oid: Generated<number>;
  schema_id: Generated<string>;
  name: Generated<string>;
  definition: Generated<string>;
  owner_id: Generated<string>;
  privileges: Generated<string[]>;
}

export interface MzInternalMzActivePeeks {
  id: string;
  index_id: string;
  time: string;
}

export interface MzInternalMzActivePeeksPerWorker {
  id: string;
  worker_id: string;
  index_id: string;
  time: string;
}

export interface MzInternalMzAggregates {
  oid: Generated<number>;
  agg_kind: Generated<string>;
  agg_num_direct_args: Generated<number>;
}

export interface MzInternalMzArrangementBatchesRaw {
  operator_id: string;
  worker_id: string;
}

export interface MzInternalMzArrangementHeapAllocationsRaw {
  operator_id: string;
  worker_id: string;
}

export interface MzInternalMzArrangementHeapCapacityRaw {
  operator_id: string;
  worker_id: string;
}

export interface MzInternalMzArrangementHeapSizeRaw {
  operator_id: string;
  worker_id: string;
}

export interface MzInternalMzArrangementRecordsRaw {
  operator_id: string;
  worker_id: string;
}

export interface MzInternalMzArrangementSharing {
  operator_id: string;
  count: Int8;
}

export interface MzInternalMzArrangementSharingPerWorker {
  operator_id: string;
  worker_id: string;
  count: Int8;
}

export interface MzInternalMzArrangementSharingRaw {
  operator_id: string;
  worker_id: string;
}

export interface MzInternalMzArrangementSizes {
  operator_id: string;
  records: Numeric;
  batches: Numeric;
  size: Numeric;
  capacity: Numeric;
  allocations: Numeric;
}

export interface MzInternalMzArrangementSizesPerWorker {
  operator_id: string;
  worker_id: string;
  records: Int8;
  batches: Int8;
  size: Int8;
  capacity: Int8;
  allocations: Int8;
}

export interface MzInternalMzClusterLinks {
  cluster_id: Generated<string>;
  object_id: Generated<string>;
}

export interface MzInternalMzClusterReplicaFrontiers {
  replica_id: Generated<string>;
  export_id: Generated<string>;
  time: Generated<string>;
}

export interface MzInternalMzClusterReplicaHeartbeats {
  replica_id: Generated<string>;
  last_heartbeat: Generated<Timestamp>;
}

export interface MzInternalMzClusterReplicaHistory {
  internal_replica_id: string | null;
  size: string | null;
  cluster_name: string | null;
  replica_name: string | null;
  created_at: Timestamp;
  dropped_at: Timestamp | null;
  credits_per_hour: Numeric;
}

export interface MzInternalMzClusterReplicaMetrics {
  replica_id: Generated<string>;
  process_id: Generated<string>;
  cpu_nano_cores: Generated<string | null>;
  memory_bytes: Generated<string | null>;
  disk_bytes: Generated<string | null>;
}

export interface MzInternalMzClusterReplicaSizes {
  size: Generated<string>;
  processes: Generated<string>;
  workers: Generated<string>;
  cpu_nano_cores: Generated<string>;
  memory_bytes: Generated<string>;
  disk_bytes: Generated<string | null>;
  credits_per_hour: Generated<Numeric>;
}

export interface MzInternalMzClusterReplicaStatuses {
  replica_id: Generated<string>;
  process_id: Generated<string>;
  status: Generated<string>;
  reason: Generated<string | null>;
  updated_at: Generated<Timestamp>;
}

export interface MzInternalMzClusterReplicaUtilization {
  replica_id: string;
  process_id: string;
  cpu_percent: number | null;
  memory_percent: number | null;
  disk_percent: number | null;
}

export interface MzInternalMzComputeDelaysHistogram {
  export_id: string;
  import_id: string;
  delay_ns: string;
  count: Numeric;
}

export interface MzInternalMzComputeDelaysHistogramPerWorker {
  export_id: string;
  import_id: string;
  worker_id: string;
  delay_ns: string;
  count: Int8;
}

export interface MzInternalMzComputeDelaysHistogramRaw {
  export_id: string;
  import_id: string;
  worker_id: string;
  delay_ns: string;
}

export interface MzInternalMzComputeDependencies {
  export_id: string;
  import_id: string;
}

export interface MzInternalMzComputeDependenciesPerWorker {
  export_id: string;
  import_id: string;
  worker_id: string;
}

export interface MzInternalMzComputeExports {
  export_id: string;
  dataflow_id: string;
}

export interface MzInternalMzComputeExportsPerWorker {
  export_id: string;
  worker_id: string;
  dataflow_id: string;
}

export interface MzInternalMzComputeFrontiers {
  export_id: string;
  time: string;
}

export interface MzInternalMzComputeFrontiersPerWorker {
  export_id: string;
  worker_id: string;
  time: string;
}

export interface MzInternalMzComputeImportFrontiers {
  export_id: string;
  import_id: string;
  time: string;
}

export interface MzInternalMzComputeImportFrontiersPerWorker {
  export_id: string;
  import_id: string;
  worker_id: string;
  time: string;
}

export interface MzInternalMzComputeOperatorDurationsHistogram {
  id: string;
  duration_ns: string;
  count: Numeric;
}

export interface MzInternalMzComputeOperatorDurationsHistogramPerWorker {
  id: string;
  worker_id: string;
  duration_ns: string;
  count: Int8;
}

export interface MzInternalMzComputeOperatorDurationsHistogramRaw {
  id: string;
  worker_id: string;
  duration_ns: string;
}

export interface MzInternalMzDataflowAddresses {
  id: string;
  address: string;
}

export interface MzInternalMzDataflowAddressesPerWorker {
  id: string;
  worker_id: string;
  address: string;
}

export interface MzInternalMzDataflowArrangementSizes {
  id: string;
  name: string;
  records: Numeric | null;
  batches: Numeric | null;
  size: Numeric | null;
  capacity: Numeric | null;
  allocations: Numeric | null;
}

export interface MzInternalMzDataflowChannelOperators {
  id: string;
  from_operator_id: string | null;
  from_operator_address: string | null;
  to_operator_id: string | null;
  to_operator_address: string | null;
}

export interface MzInternalMzDataflowChannelOperatorsPerWorker {
  id: string;
  worker_id: string;
  from_operator_id: string | null;
  from_operator_address: string | null;
  to_operator_id: string | null;
  to_operator_address: string | null;
}

export interface MzInternalMzDataflowChannels {
  id: string;
  from_index: string;
  from_port: string;
  to_index: string;
  to_port: string;
}

export interface MzInternalMzDataflowChannelsPerWorker {
  id: string;
  worker_id: string;
  from_index: string;
  from_port: string;
  to_index: string;
  to_port: string;
}

export interface MzInternalMzDataflowOperatorDataflows {
  id: string;
  name: string;
  dataflow_id: string;
  dataflow_name: string;
}

export interface MzInternalMzDataflowOperatorDataflowsPerWorker {
  id: string;
  name: string;
  worker_id: string;
  dataflow_id: string;
  dataflow_name: string;
}

export interface MzInternalMzDataflowOperatorParents {
  id: string;
  parent_id: string;
}

export interface MzInternalMzDataflowOperatorParentsPerWorker {
  id: string;
  parent_id: string;
  worker_id: string;
}

export interface MzInternalMzDataflowOperatorReachability {
  address: string;
  port: string;
  update_type: string;
  time: string | null;
  count: Numeric;
}

export interface MzInternalMzDataflowOperatorReachabilityPerWorker {
  address: string;
  port: string;
  worker_id: string;
  update_type: string;
  time: string | null;
  count: Int8;
}

export interface MzInternalMzDataflowOperatorReachabilityRaw {
  address: string;
  port: string;
  worker_id: string;
  update_type: string;
  time: string | null;
}

export interface MzInternalMzDataflowOperators {
  id: string;
  name: string;
}

export interface MzInternalMzDataflowOperatorsPerWorker {
  id: string;
  worker_id: string;
  name: string;
}

export interface MzInternalMzDataflows {
  id: string;
  local_id: string | null;
  name: string;
}

export interface MzInternalMzDataflowShutdownDurationsHistogram {
  duration_ns: string;
  count: Numeric;
}

export interface MzInternalMzDataflowShutdownDurationsHistogramPerWorker {
  worker_id: string;
  duration_ns: string;
  count: Int8;
}

export interface MzInternalMzDataflowShutdownDurationsHistogramRaw {
  worker_id: string;
  duration_ns: string;
}

export interface MzInternalMzDataflowsPerWorker {
  id: string;
  worker_id: string;
  local_id: string | null;
  name: string;
}

export interface MzInternalMzKafkaSources {
  id: Generated<string>;
  group_id_base: Generated<string>;
}

export interface MzInternalMzMessageCounts {
  channel_id: string;
  sent: Numeric;
  received: Numeric;
}

export interface MzInternalMzMessageCountsPerWorker {
  channel_id: string;
  from_worker_id: string;
  to_worker_id: string;
  sent: Int8;
  received: Int8;
}

export interface MzInternalMzMessageCountsReceivedRaw {
  channel_id: string;
  from_worker_id: string;
  to_worker_id: string;
}

export interface MzInternalMzMessageCountsSentRaw {
  channel_id: string;
  from_worker_id: string;
  to_worker_id: string;
}

export interface MzInternalMzObjectDependencies {
  object_id: Generated<string>;
  referenced_object_id: Generated<string>;
}

export interface MzInternalMzObjectTransitiveDependencies {
  id: string | null;
  referenced_object_id: string | null;
}

export interface MzInternalMzPeekDurationsHistogram {
  duration_ns: string;
  count: Numeric;
}

export interface MzInternalMzPeekDurationsHistogramPerWorker {
  worker_id: string;
  duration_ns: string;
  count: Int8;
}

export interface MzInternalMzPeekDurationsHistogramRaw {
  worker_id: string;
  duration_ns: string;
}

export interface MzInternalMzPostgresSources {
  id: Generated<string>;
  replication_slot: Generated<string>;
}

export interface MzInternalMzRecordsPerDataflow {
  id: string;
  name: string;
  records: Numeric;
  size: Numeric;
  capacity: Numeric;
  allocations: Numeric;
}

export interface MzInternalMzRecordsPerDataflowOperator {
  id: string;
  name: string;
  dataflow_id: string;
  records: Numeric;
  size: Numeric;
  capacity: Numeric;
  allocations: Numeric;
}

export interface MzInternalMzRecordsPerDataflowOperatorPerWorker {
  id: string;
  name: string;
  worker_id: string;
  dataflow_id: string;
  records: Int8;
  size: Int8;
  capacity: Int8;
  allocations: Int8;
}

export interface MzInternalMzRecordsPerDataflowPerWorker {
  id: string;
  name: string;
  worker_id: string;
  records: Numeric;
  size: Numeric;
  capacity: Numeric;
  allocations: Numeric;
}

export interface MzInternalMzSchedulingElapsed {
  id: string;
  elapsed_ns: Numeric;
}

export interface MzInternalMzSchedulingElapsedPerWorker {
  id: string;
  worker_id: string;
  elapsed_ns: Int8;
}

export interface MzInternalMzSchedulingElapsedRaw {
  id: string;
  worker_id: string;
}

export interface MzInternalMzSchedulingParksHistogram {
  slept_for_ns: string;
  requested_ns: string;
  count: Numeric;
}

export interface MzInternalMzSchedulingParksHistogramPerWorker {
  worker_id: string;
  slept_for_ns: string;
  requested_ns: string;
  count: Int8;
}

export interface MzInternalMzSchedulingParksHistogramRaw {
  worker_id: string;
  slept_for_ns: string;
  requested_ns: string;
}

export interface MzInternalMzSessions {
  id: Generated<string>;
  role_id: Generated<string>;
  connected_at: Generated<Timestamp>;
}

export interface MzInternalMzShowClusterReplicas {
  cluster: string;
  replica: string;
  size: string | null;
  ready: boolean;
}

export interface MzInternalMzShowIndexes {
  name: string;
  on: string;
  cluster: string;
  key: string[] | null;
  on_id: string;
  schema_id: string;
  cluster_id: string;
}

export interface MzInternalMzShowMaterializedViews {
  name: string;
  cluster: string;
  schema_id: string;
  cluster_id: string;
}

export interface MzInternalMzSinkStatistics {
  id: string;
  worker_id: string;
  messages_staged: string;
  messages_committed: string;
  bytes_staged: string;
  bytes_committed: string;
}

export interface MzInternalMzSinkStatuses {
  id: string;
  name: string;
  type: string;
  last_status_change_at: Timestamp | null;
  status: string | null;
  error: string | null;
  details: Json | null;
}

export interface MzInternalMzSinkStatusHistory {
  occurred_at: Timestamp;
  sink_id: string;
  status: string;
  error: string | null;
  details: Json | null;
}

export interface MzInternalMzSourceStatistics {
  id: string;
  worker_id: string;
  snapshot_committed: boolean;
  messages_received: string;
  updates_staged: string;
  updates_committed: string;
  bytes_received: string;
  envelope_state_bytes: string;
  envelope_state_count: string;
}

export interface MzInternalMzSourceStatuses {
  id: string;
  name: string;
  type: string;
  last_status_change_at: Timestamp | null;
  status: string | null;
  error: string | null;
  details: Json | null;
}

export interface MzInternalMzSourceStatusHistory {
  occurred_at: Timestamp;
  source_id: string;
  status: string;
  error: string | null;
  details: Json | null;
}

export interface MzInternalMzStorageShards {
  object_id: string;
  shard_id: string;
}

export interface MzInternalMzStorageUsageByShard {
  id: Generated<string>;
  shard_id: Generated<string | null>;
  size_bytes: Generated<string>;
  collection_timestamp: Generated<Timestamp>;
}

export interface MzInternalMzSubscriptions {
  id: Generated<string>;
  session_id: Generated<string>;
  cluster_id: Generated<string>;
  created_at: Generated<Timestamp>;
  referenced_object_ids: Generated<string>;
}

export interface MzInternalMzViewForeignKeys {
  child_id: Generated<string>;
  child_column: Generated<string>;
  parent_id: Generated<string>;
  parent_column: Generated<string>;
  key_group: Generated<string>;
}

export interface MzInternalMzViewKeys {
  object_id: Generated<string>;
  column: Generated<string>;
  key_group: Generated<string>;
}

export interface DB {
  companies: Companies;
  "mz_catalog.mz_array_types": MzCatalogMzArrayTypes;
  "mz_catalog.mz_audit_events": MzCatalogMzAuditEvents;
  "mz_catalog.mz_aws_privatelink_connections": MzCatalogMzAwsPrivatelinkConnections;
  "mz_catalog.mz_base_types": MzCatalogMzBaseTypes;
  "mz_catalog.mz_cluster_replicas": MzCatalogMzClusterReplicas;
  "mz_catalog.mz_clusters": MzCatalogMzClusters;
  "mz_catalog.mz_columns": MzCatalogMzColumns;
  "mz_catalog.mz_connections": MzCatalogMzConnections;
  "mz_catalog.mz_databases": MzCatalogMzDatabases;
  "mz_catalog.mz_default_privileges": MzCatalogMzDefaultPrivileges;
  "mz_catalog.mz_egress_ips": MzCatalogMzEgressIps;
  "mz_catalog.mz_functions": MzCatalogMzFunctions;
  "mz_catalog.mz_index_columns": MzCatalogMzIndexColumns;
  "mz_catalog.mz_indexes": MzCatalogMzIndexes;
  "mz_catalog.mz_kafka_connections": MzCatalogMzKafkaConnections;
  "mz_catalog.mz_kafka_sinks": MzCatalogMzKafkaSinks;
  "mz_catalog.mz_list_types": MzCatalogMzListTypes;
  "mz_catalog.mz_map_types": MzCatalogMzMapTypes;
  "mz_catalog.mz_materialized_views": MzCatalogMzMaterializedViews;
  "mz_catalog.mz_objects": MzCatalogMzObjects;
  "mz_catalog.mz_operators": MzCatalogMzOperators;
  "mz_catalog.mz_pseudo_types": MzCatalogMzPseudoTypes;
  "mz_catalog.mz_relations": MzCatalogMzRelations;
  "mz_catalog.mz_role_members": MzCatalogMzRoleMembers;
  "mz_catalog.mz_roles": MzCatalogMzRoles;
  "mz_catalog.mz_schemas": MzCatalogMzSchemas;
  "mz_catalog.mz_secrets": MzCatalogMzSecrets;
  "mz_catalog.mz_sinks": MzCatalogMzSinks;
  "mz_catalog.mz_sources": MzCatalogMzSources;
  "mz_catalog.mz_ssh_tunnel_connections": MzCatalogMzSshTunnelConnections;
  "mz_catalog.mz_storage_usage": MzCatalogMzStorageUsage;
  "mz_catalog.mz_tables": MzCatalogMzTables;
  "mz_catalog.mz_types": MzCatalogMzTypes;
  "mz_catalog.mz_views": MzCatalogMzViews;
  "mz_internal.mz_active_peeks": MzInternalMzActivePeeks;
  "mz_internal.mz_active_peeks_per_worker": MzInternalMzActivePeeksPerWorker;
  "mz_internal.mz_aggregates": MzInternalMzAggregates;
  "mz_internal.mz_arrangement_batches_raw": MzInternalMzArrangementBatchesRaw;
  "mz_internal.mz_arrangement_heap_allocations_raw": MzInternalMzArrangementHeapAllocationsRaw;
  "mz_internal.mz_arrangement_heap_capacity_raw": MzInternalMzArrangementHeapCapacityRaw;
  "mz_internal.mz_arrangement_heap_size_raw": MzInternalMzArrangementHeapSizeRaw;
  "mz_internal.mz_arrangement_records_raw": MzInternalMzArrangementRecordsRaw;
  "mz_internal.mz_arrangement_sharing": MzInternalMzArrangementSharing;
  "mz_internal.mz_arrangement_sharing_per_worker": MzInternalMzArrangementSharingPerWorker;
  "mz_internal.mz_arrangement_sharing_raw": MzInternalMzArrangementSharingRaw;
  "mz_internal.mz_arrangement_sizes": MzInternalMzArrangementSizes;
  "mz_internal.mz_arrangement_sizes_per_worker": MzInternalMzArrangementSizesPerWorker;
  "mz_internal.mz_cluster_links": MzInternalMzClusterLinks;
  "mz_internal.mz_cluster_replica_frontiers": MzInternalMzClusterReplicaFrontiers;
  "mz_internal.mz_cluster_replica_heartbeats": MzInternalMzClusterReplicaHeartbeats;
  "mz_internal.mz_cluster_replica_history": MzInternalMzClusterReplicaHistory;
  "mz_internal.mz_cluster_replica_metrics": MzInternalMzClusterReplicaMetrics;
  "mz_internal.mz_cluster_replica_sizes": MzInternalMzClusterReplicaSizes;
  "mz_internal.mz_cluster_replica_statuses": MzInternalMzClusterReplicaStatuses;
  "mz_internal.mz_cluster_replica_utilization": MzInternalMzClusterReplicaUtilization;
  "mz_internal.mz_compute_delays_histogram": MzInternalMzComputeDelaysHistogram;
  "mz_internal.mz_compute_delays_histogram_per_worker": MzInternalMzComputeDelaysHistogramPerWorker;
  "mz_internal.mz_compute_delays_histogram_raw": MzInternalMzComputeDelaysHistogramRaw;
  "mz_internal.mz_compute_dependencies": MzInternalMzComputeDependencies;
  "mz_internal.mz_compute_dependencies_per_worker": MzInternalMzComputeDependenciesPerWorker;
  "mz_internal.mz_compute_exports": MzInternalMzComputeExports;
  "mz_internal.mz_compute_exports_per_worker": MzInternalMzComputeExportsPerWorker;
  "mz_internal.mz_compute_frontiers": MzInternalMzComputeFrontiers;
  "mz_internal.mz_compute_frontiers_per_worker": MzInternalMzComputeFrontiersPerWorker;
  "mz_internal.mz_compute_import_frontiers": MzInternalMzComputeImportFrontiers;
  "mz_internal.mz_compute_import_frontiers_per_worker": MzInternalMzComputeImportFrontiersPerWorker;
  "mz_internal.mz_compute_operator_durations_histogram": MzInternalMzComputeOperatorDurationsHistogram;
  "mz_internal.mz_compute_operator_durations_histogram_per_worker": MzInternalMzComputeOperatorDurationsHistogramPerWorker;
  "mz_internal.mz_compute_operator_durations_histogram_raw": MzInternalMzComputeOperatorDurationsHistogramRaw;
  "mz_internal.mz_dataflow_addresses": MzInternalMzDataflowAddresses;
  "mz_internal.mz_dataflow_addresses_per_worker": MzInternalMzDataflowAddressesPerWorker;
  "mz_internal.mz_dataflow_arrangement_sizes": MzInternalMzDataflowArrangementSizes;
  "mz_internal.mz_dataflow_channel_operators": MzInternalMzDataflowChannelOperators;
  "mz_internal.mz_dataflow_channel_operators_per_worker": MzInternalMzDataflowChannelOperatorsPerWorker;
  "mz_internal.mz_dataflow_channels": MzInternalMzDataflowChannels;
  "mz_internal.mz_dataflow_channels_per_worker": MzInternalMzDataflowChannelsPerWorker;
  "mz_internal.mz_dataflow_operator_dataflows": MzInternalMzDataflowOperatorDataflows;
  "mz_internal.mz_dataflow_operator_dataflows_per_worker": MzInternalMzDataflowOperatorDataflowsPerWorker;
  "mz_internal.mz_dataflow_operator_parents": MzInternalMzDataflowOperatorParents;
  "mz_internal.mz_dataflow_operator_parents_per_worker": MzInternalMzDataflowOperatorParentsPerWorker;
  "mz_internal.mz_dataflow_operator_reachability": MzInternalMzDataflowOperatorReachability;
  "mz_internal.mz_dataflow_operator_reachability_per_worker": MzInternalMzDataflowOperatorReachabilityPerWorker;
  "mz_internal.mz_dataflow_operator_reachability_raw": MzInternalMzDataflowOperatorReachabilityRaw;
  "mz_internal.mz_dataflow_operators": MzInternalMzDataflowOperators;
  "mz_internal.mz_dataflow_operators_per_worker": MzInternalMzDataflowOperatorsPerWorker;
  "mz_internal.mz_dataflow_shutdown_durations_histogram": MzInternalMzDataflowShutdownDurationsHistogram;
  "mz_internal.mz_dataflow_shutdown_durations_histogram_per_worker": MzInternalMzDataflowShutdownDurationsHistogramPerWorker;
  "mz_internal.mz_dataflow_shutdown_durations_histogram_raw": MzInternalMzDataflowShutdownDurationsHistogramRaw;
  "mz_internal.mz_dataflows": MzInternalMzDataflows;
  "mz_internal.mz_dataflows_per_worker": MzInternalMzDataflowsPerWorker;
  "mz_internal.mz_kafka_sources": MzInternalMzKafkaSources;
  "mz_internal.mz_message_counts": MzInternalMzMessageCounts;
  "mz_internal.mz_message_counts_per_worker": MzInternalMzMessageCountsPerWorker;
  "mz_internal.mz_message_counts_received_raw": MzInternalMzMessageCountsReceivedRaw;
  "mz_internal.mz_message_counts_sent_raw": MzInternalMzMessageCountsSentRaw;
  "mz_internal.mz_object_dependencies": MzInternalMzObjectDependencies;
  "mz_internal.mz_object_transitive_dependencies": MzInternalMzObjectTransitiveDependencies;
  "mz_internal.mz_peek_durations_histogram": MzInternalMzPeekDurationsHistogram;
  "mz_internal.mz_peek_durations_histogram_per_worker": MzInternalMzPeekDurationsHistogramPerWorker;
  "mz_internal.mz_peek_durations_histogram_raw": MzInternalMzPeekDurationsHistogramRaw;
  "mz_internal.mz_postgres_sources": MzInternalMzPostgresSources;
  "mz_internal.mz_records_per_dataflow": MzInternalMzRecordsPerDataflow;
  "mz_internal.mz_records_per_dataflow_operator": MzInternalMzRecordsPerDataflowOperator;
  "mz_internal.mz_records_per_dataflow_operator_per_worker": MzInternalMzRecordsPerDataflowOperatorPerWorker;
  "mz_internal.mz_records_per_dataflow_per_worker": MzInternalMzRecordsPerDataflowPerWorker;
  "mz_internal.mz_scheduling_elapsed": MzInternalMzSchedulingElapsed;
  "mz_internal.mz_scheduling_elapsed_per_worker": MzInternalMzSchedulingElapsedPerWorker;
  "mz_internal.mz_scheduling_elapsed_raw": MzInternalMzSchedulingElapsedRaw;
  "mz_internal.mz_scheduling_parks_histogram": MzInternalMzSchedulingParksHistogram;
  "mz_internal.mz_scheduling_parks_histogram_per_worker": MzInternalMzSchedulingParksHistogramPerWorker;
  "mz_internal.mz_scheduling_parks_histogram_raw": MzInternalMzSchedulingParksHistogramRaw;
  "mz_internal.mz_sessions": MzInternalMzSessions;
  "mz_internal.mz_show_cluster_replicas": MzInternalMzShowClusterReplicas;
  "mz_internal.mz_show_indexes": MzInternalMzShowIndexes;
  "mz_internal.mz_show_materialized_views": MzInternalMzShowMaterializedViews;
  "mz_internal.mz_sink_statistics": MzInternalMzSinkStatistics;
  "mz_internal.mz_sink_status_history": MzInternalMzSinkStatusHistory;
  "mz_internal.mz_sink_statuses": MzInternalMzSinkStatuses;
  "mz_internal.mz_source_statistics": MzInternalMzSourceStatistics;
  "mz_internal.mz_source_status_history": MzInternalMzSourceStatusHistory;
  "mz_internal.mz_source_statuses": MzInternalMzSourceStatuses;
  "mz_internal.mz_storage_shards": MzInternalMzStorageShards;
  "mz_internal.mz_storage_usage_by_shard": MzInternalMzStorageUsageByShard;
  "mz_internal.mz_subscriptions": MzInternalMzSubscriptions;
  "mz_internal.mz_view_foreign_keys": MzInternalMzViewForeignKeys;
  "mz_internal.mz_view_keys": MzInternalMzViewKeys;
}
